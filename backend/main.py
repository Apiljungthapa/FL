"""
Consultation form handler (FastAPI port of the former consult.php).

Run locally:   python -m uvicorn backend.main:app --port 8000
The site's form posts to /api/consult. See backend/README.md.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import lib
from .lib import (
    DATA_DIR,
    MAIL_FROM,
    RECIPIENT_EMAIL,
    append_line,
    clean,
    ensure_data_dir,
    is_valid_email,
    send_mail,
    send_or_queue_confirmation,
    update_json_list,
)

# ---- Config ----
RATE_LIMIT_MAX = 5  # max submissions
RATE_LIMIT_WINDOW = 600  # per this many seconds, per IP
MAX_FIELD_LEN = 3000
ALLOWED_REGIONS = ["United States", "United Kingdom", "Europe", "Asia Pacific", "Middle East", "Others"]

# ---- Hardening: never leak errors to the client; real errors go to
# data/error.log on the server only. ----
ensure_data_dir()
_handler = logging.FileHandler(DATA_DIR / "error.log", encoding="utf-8")
_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
lib.logger.addHandler(_handler)
lib.logger.setLevel(logging.INFO)
lib.logger.addHandler(logging.StreamHandler())

if lib.SMTP_HOST and not lib.smtp_ready():
    lib.logger.warning("SMTP_PASSWORD is empty in backend/.env; emails go to data/outbox.log until it is set.")
elif not lib.SMTP_HOST:
    lib.logger.warning("SMTP_HOST is empty; emails go to data/outbox.log instead of being sent.")

app = FastAPI(title="Forth Ledger API", docs_url=None, redoc_url=None, openapi_url=None)

SECURITY_HEADERS = {"X-Content-Type-Options": "nosniff"}


def fail(status: int, message: str) -> JSONResponse:
    return JSONResponse({"success": False, "error": message}, status_code=status, headers=SECURITY_HEADERS)


def ok(extra: dict[str, Any] | None = None) -> JSONResponse:
    return JSONResponse({"success": True, **(extra or {})}, headers=SECURITY_HEADERS)


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    if exc.status_code == 405:
        return fail(405, "Method not allowed")
    if exc.status_code == 404:
        return fail(404, "Not found")
    return fail(exc.status_code, "Request failed")


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    return fail(400, "Invalid request body")


@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception) -> JSONResponse:
    lib.logger.exception("Unhandled error")
    return fail(500, "Something went wrong. Please try again.")


def _as_str(value: Any) -> str:
    if value is None or isinstance(value, (dict, list)):
        return ""
    if isinstance(value, bool):
        return "1" if value else ""
    return str(value)


def _as_int(value: Any) -> int:
    """Lenient int cast, like PHP's (int)."""
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        digits = ""
        for i, ch in enumerate(value.strip()):
            if ch.isdigit() or (i == 0 and ch in "+-"):
                digits += ch
            else:
                break
        try:
            return int(digits)
        except ValueError:
            return 0
    return 0


async def _parse_body(request: Request) -> dict[str, Any] | None:
    """Accept JSON or classic form submission."""
    content_type = request.headers.get("content-type", "")
    raw = await request.body()
    if "application/json" in content_type:
        try:
            data = json.loads(raw or b"")
        except ValueError:
            return None
        return data if isinstance(data, dict) else None
    if "multipart/form-data" in content_type:
        form = await request.form()
        return {k: v for k, v in form.items() if isinstance(v, str)}
    parsed = parse_qs(raw.decode("utf-8", errors="replace"), keep_blank_values=True)
    return {k: v[-1] for k, v in parsed.items()}


def _rate_limited(ip_hash: str) -> bool:
    """Records this attempt and returns True if the IP is over the limit."""
    path = DATA_DIR / f"ratelimit_{ip_hash}.json"
    now = int(time.time())
    blocked = False

    def apply(stamps: list) -> list:
        nonlocal blocked
        recent = [t for t in stamps if isinstance(t, (int, float)) and now - t < RATE_LIMIT_WINDOW]
        if len(recent) >= RATE_LIMIT_MAX:
            blocked = True
            return recent
        return recent + [now]

    try:
        update_json_list(path, apply)
    except OSError:
        lib.logger.exception("Rate limit file error")
    return blocked


@app.post("/api/consult")
@app.post("/api/consult.php")  # keeps the old URL working
async def consult(request: Request) -> JSONResponse:
    data = await _parse_body(request)
    if data is None:
        return fail(400, "Invalid request body")

    # ---- Honeypot: real users never fill this hidden field ----
    if data.get("website"):
        # Pretend success so bots don't learn to avoid the trap.
        return ok()

    # ---- Fill-speed check: real people take at least a couple seconds
    # to read and fill the form; scripted submitters typically post
    # within milliseconds of loading the page. ----
    elapsed_ms = _as_int(data.get("elapsedMs", 0))
    if 0 < elapsed_ms < 2000:
        # Pretend success so bots don't learn to slow down.
        return ok()

    # ---- Rate limit by IP ----
    ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(ip.encode()).hexdigest()
    if _rate_limited(ip_hash):
        return fail(429, "Too many requests. Please try again later.")

    # ---- Validate & sanitize fields ----
    name = clean(_as_str(data.get("name")), 200)
    email = clean(_as_str(data.get("email")), 200)
    company = clean(_as_str(data.get("company")), 200)
    region = clean(_as_str(data.get("region")), 100)
    message = clean(_as_str(data.get("message")), MAX_FIELD_LEN)

    if name == "" or len(name) < 2:
        return fail(422, "Please enter your full name.")
    if not is_valid_email(email):
        return fail(422, "Please enter a valid email address.")
    if region not in ALLOWED_REGIONS:
        return fail(422, "Please select a region.")
    if message == "":
        return fail(422, "Please tell us what you need help with.")

    # ---- Compose a plain-text email. From is always our own domain;
    # the visitor's address only ever appears in Reply-To. ----
    subject = "New consultation request" + (f" — {company}" if company else "")
    body = "\n".join(
        [
            "New consultation request from the website",
            "",
            "Name:    " + name,
            "Email:   " + email,
            "Company: " + (company or "-"),
            "Region:  " + (region or "-"),
            "",
            "Message:",
            message or "(none provided)",
            "",
            "---",
            "Submitted: " + datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z"),
            "IP hash:   " + ip_hash[:12],
        ]
    )

    safe_name = name.replace('"', "").replace("<", "").replace(">", "")
    sent = send_mail(
        RECIPIENT_EMAIL,
        subject,
        body,
        from_name="Forth Ledger Website",
        reply_to=f'"{safe_name}" <{email}>',
    )

    # ---- Local backup log, in case mail delivery fails ----
    append_line(
        DATA_DIR / "submissions.log",
        json.dumps(
            {
                "time": datetime.now().astimezone().isoformat(timespec="seconds"),
                "name": name,
                "email": email,
                "company": company,
                "region": region,
                "message": message,
                "mail_sent": sent,
            },
            ensure_ascii=False,
        ),
    )

    # ---- Confirm to the submitter that we received their request ----
    # Best-effort and never blocks the response above: if mail is down
    # right now, this gets queued and retry_confirmations.py (run on a
    # cron schedule) keeps trying until it succeeds.
    send_or_queue_confirmation(name, email)

    if not sent:
        # We still saved it to the log above, so the lead isn't lost.
        return fail(502, "Could not send email right now, please try again or email us directly.")

    return ok()


@app.api_route("/api/consult", methods=["GET", "PUT", "PATCH", "DELETE"], include_in_schema=False)
@app.api_route("/api/consult.php", methods=["GET", "PUT", "PATCH", "DELETE"], include_in_schema=False)
async def consult_wrong_method() -> JSONResponse:
    return fail(405, "Method not allowed")


@app.get("/api/health")
async def health() -> JSONResponse:
    return ok({"mail": "smtp" if lib.smtp_ready() else "console", "from": MAIL_FROM})


# ---- Optionally serve the built frontend (npm run build -> dist/) so
# a single `uvicorn` process can host the whole site in production. ----
DIST_DIR = Path(__file__).resolve().parent.parent / "dist"
if DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str):
        if path.startswith("api/"):
            return fail(404, "Not found")
        candidate = (DIST_DIR / path).resolve()
        if path and candidate.is_file() and DIST_DIR in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(DIST_DIR / "index.html")
