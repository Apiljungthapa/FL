"""
Shared config and helpers for the consultation form backend
(main.py) and its background confirmation-email retry job
(retry_confirmations.py). See README.md.
"""

from __future__ import annotations

import json
import logging
import os
import re
import smtplib
import ssl
import threading
import time
from email.message import EmailMessage
from email.utils import formataddr
from pathlib import Path
from typing import Any, Callable


def _load_env_file(path: Path) -> None:
    """Minimal .env loader (KEY=VALUE lines); real env vars win."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file(Path(__file__).resolve().parent / ".env")
# ---- Config: override with environment variables (or a .env file) ----
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL", "connect@forthledger.com")
MAIL_FROM = os.getenv("MAIL_FROM", "connect@forthledger.com")  # reuses your existing mailbox, no new one needed

# SMTP settings. If SMTP_HOST is empty, emails are written to
# data/outbox.log instead of being sent ("console" mode) so the
# whole flow works locally without a mail server.
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
# "starttls" (port 587), "ssl" (port 465) or "none"
SMTP_SECURITY = os.getenv("SMTP_SECURITY", "starttls").lower()
SMTP_TIMEOUT = float(os.getenv("SMTP_TIMEOUT", "15"))

DATA_DIR = Path(os.getenv("DATA_DIR", str(Path(__file__).resolve().parent / "data")))
CONFIRMATION_QUEUE = DATA_DIR / "confirmation_queue.json"
# ~ a few hours of coverage at a 10-15 minute cron interval before we
# give up on a single confirmation and log it as a permanent failure.
CONFIRMATION_MAX_ATTEMPTS = 20

MAILER = "Python/FastAPI"

logger = logging.getLogger("forthledger")

# Serializes read-modify-write of the JSON state files within this
# process. Run uvicorn with a single worker (the default) so this
# covers every request.
_file_lock = threading.RLock()

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F]")
# Mirrors the practical shape PHP's FILTER_VALIDATE_EMAIL accepts.
_EMAIL_RE = re.compile(
    r"^(?!\.)[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}(?<!\.)"
    r"@(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,63}$"
)


def clean(value: str, max_len: int = 3000) -> str:
    """Strip control/newline characters so nothing can end up injecting
    extra headers or corrupting a log file, regardless of where a
    field is later used."""
    value = value.replace("\r", " ").replace("\n", " ").replace("\0", " ")
    value = _CONTROL_CHARS.sub("", value).strip()
    return value[:max_len]


def is_valid_email(email: str) -> bool:
    return bool(_EMAIL_RE.match(email)) and ".." not in email


def ensure_data_dir() -> None:
    try:
        DATA_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    except OSError:
        logger.exception("Could not create data dir")


def append_line(path: Path, line: str) -> None:
    ensure_data_dir()
    try:
        with _file_lock, open(path, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        logger.exception("Could not write %s", path)


def update_json_list(path: Path, fn: Callable[[list], list]) -> list:
    """Locked read-modify-write of a JSON array stored on disk."""
    ensure_data_dir()
    with _file_lock:
        try:
            data = json.loads(path.read_text(encoding="utf-8") or "[]")
        except (OSError, ValueError):
            data = []
        if not isinstance(data, list):
            data = []
        new = fn(data)
        path.write_text(json.dumps(new), encoding="utf-8")
        return new


def smtp_ready() -> bool:
    """True when SMTP is fully configured. A host with a login user but
    no password would fail every send, so treat that as console mode."""
    return bool(SMTP_HOST) and not (SMTP_USER and not SMTP_PASSWORD)


def send_mail(
    to: str,
    subject: str,
    body: str,
    from_name: str,
    reply_to: str,
) -> bool:
    """Send a plain-text email. Never raises; returns False on failure."""
    msg = EmailMessage()
    msg["From"] = formataddr((from_name, MAIL_FROM))
    msg["To"] = to
    msg["Reply-To"] = reply_to
    msg["Subject"] = subject
    msg["X-Mailer"] = MAILER
    msg.set_content(body, charset="utf-8")

    if not smtp_ready():
        # Console mode: no usable mail server configured, record what
        # would have been sent so local development still shows the flow.
        append_line(DATA_DIR / "outbox.log", msg.as_string() + "\n" + "=" * 60)
        logger.info("Email (console mode) to %s: %s", to, subject)
        return True

    try:
        if SMTP_SECURITY == "ssl":
            server: smtplib.SMTP = smtplib.SMTP_SSL(
                SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT, context=ssl.create_default_context()
            )
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT)
        with server:
            if SMTP_SECURITY == "starttls":
                server.starttls(context=ssl.create_default_context())
            if SMTP_USER:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception:
        logger.exception("Sending email to %s failed", to)
        return False


def confirmation_email(name: str) -> tuple[str, str]:
    """Builds the short "we received your request" email sent to the
    person who filled out the form. Reply-To points back at our own
    inbox so a reply from them reaches us, not a no-reply address."""
    subject = "We've received your request — Forth Ledger"
    body = "\n".join(
        [
            f"Hi {name},",
            "",
            "Thanks for reaching out to Forth Ledger. We've received your consultation request and will get back to you within one business day.",
            "",
            "If anything changes on your end in the meantime, just reply to this email.",
            "",
            "— The Forth Ledger team",
        ]
    )
    return subject, body


def send_confirmation(name: str, email: str) -> bool:
    subject, body = confirmation_email(name)
    return send_mail(email, subject, body, from_name="Forth Ledger", reply_to=RECIPIENT_EMAIL)


def send_or_queue_confirmation(name: str, email: str) -> bool:
    """Best-effort send: tries once immediately so most submitters get
    the confirmation right away. If the mail server is down or the
    send otherwise fails, the confirmation is queued to disk instead
    of being dropped — retry_confirmations.py (run on a cron schedule)
    works through that queue until it succeeds or the entry ages out.
    Never raises; failure here must never affect the form's own
    success response."""
    try:
        sent = send_confirmation(name, email)
        if not sent:
            queue_confirmation(name, email)
        return sent
    except Exception:
        logger.exception("Confirmation handling failed")
        return False


def queue_confirmation(name: str, email: str) -> None:
    entry: dict[str, Any] = {
        "name": name,
        "email": email,
        "attempts": 0,
        "queued_at": int(time.time()),
    }
    try:
        update_json_list(CONFIRMATION_QUEUE, lambda q: q + [entry])
    except OSError:
        logger.exception("Could not queue confirmation")
