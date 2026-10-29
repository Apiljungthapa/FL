# Consultation form backend (FastAPI)

A Python FastAPI endpoint that emails you when someone submits the
"Book my consultation" form, and emails the submitter back to confirm
it went through. There's no database: all state lives in plain files
under `data/`. This replaces the former PHP backend (`php-api/`) and
behaves the same way.

## Files

- **`lib.py`**: shared config (`RECIPIENT_EMAIL`, `MAIL_FROM`, SMTP
  settings) and helpers used by both modules below. Configure it with
  environment variables or a `backend/.env` file (copy `.env.example`).
- **`main.py`**: the FastAPI app. `POST /api/consult` is the form
  endpoint. The old `POST /api/consult.php` path still works as an
  alias. `GET /api/health` reports the mail mode.
- **`retry_confirmations.py`**: run on a cron schedule (see below) to
  retry any confirmation emails that failed to send immediately.

## How it protects you

- **Honeypot field** silently drops bot submissions.
- **Fill-speed check**: anything submitted less than 2s after page
  load is silently dropped.
- **Rate limiting**: 5 submissions per IP per 10 minutes, enforced
  server-side via a local file.
- **Input sanitized** before it ever reaches an email body or a log
  file. Control characters and newlines are stripped, so nobody can
  inject extra email headers or corrupt the log.
- **`From:` is always your own domain.** The visitor's address only
  ever appears in `Reply-To`.
- **No error detail is ever sent to the browser.** Real errors go to
  `data/error.log` on the server only.
- **`data/` is never served over HTTP.** Only `/api/*` and the built
  `dist/` site are exposed.

## What happens on a submission

1. The lead is validated, rate-limit checked, and emailed to
   `RECIPIENT_EMAIL`. Whether this email sends is the only thing that
   decides whether the browser sees success or failure.
2. The lead is saved to `data/submissions.log` either way, so it's
   never lost even if step 1's email fails to send.
3. The submitter gets a short "we received your request" confirmation
   email, sent immediately. **This step never affects the response.**
4. If that confirmation fails to send, it's queued to
   `data/confirmation_queue.json`. `retry_confirmations.py` keeps
   retrying each entry until it succeeds or hits
   `CONFIRMATION_MAX_ATTEMPTS` (20). After that it gives up and logs
   the entry to `data/confirmation_failures.log`.

## Configuration

| Variable          | Default                   | Notes                                   |
|-------------------|---------------------------|-----------------------------------------|
| `RECIPIENT_EMAIL` | `connect@forthledger.com` | Where leads go                          |
| `MAIL_FROM`       | `connect@forthledger.com` | Must be on your own domain              |
| `SMTP_HOST`       | *(empty)*                 | Empty = console mode (`data/outbox.log`) |
| `SMTP_PORT`       | `587`                     |                                         |
| `SMTP_USER`       | *(empty)*                 | Login is skipped if empty               |
| `SMTP_PASSWORD`   | *(empty)*                 |                                         |
| `SMTP_SECURITY`   | `starttls`                | `starttls`, `ssl` (port 465) or `none`  |
| `DATA_DIR`        | `backend/data`            |                                         |

PHP's `mail()` used the host's local sendmail. Python sends through
SMTP instead, so for production set `SMTP_HOST`, `SMTP_USER` and
`SMTP_PASSWORD` to your mailbox's SMTP details. On cPanel, those are
under Email Accounts → Connect Devices.

## Run

From the project root:

```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Run a single worker (the default). The file locks are per-process.

## Check that email works

`backend/.env` is already set up for forthledger.com's cPanel mail
server (`mail.forthledger.com`, SSL, port 465, login
`connect@forthledger.com`). Put that mailbox's password in
`SMTP_PASSWORD`, restart the backend, then run:

```bash
python -m backend.send_test_email                  # sends to RECIPIENT_EMAIL
python -m backend.send_test_email someone@gmail.com
```

It prints `Sent.` or the exact reason it failed (for example a wrong
password). Until the password is set, the form still works and saves
emails to `data/outbox.log` instead of failing.

## Cron job for confirmation retries

Every 15 minutes, from the project root:

```
python -m backend.retry_confirmations
```

It prints a summary like `Confirmation retry: sent 1, gave up on 0,
0 still queued.` It only runs from the command line and isn't exposed
over HTTP.

## Notes

`data/submissions.log`, `confirmation_queue.json` and
`confirmation_failures.log` hold names and emails. Treat them as
sensitive.
