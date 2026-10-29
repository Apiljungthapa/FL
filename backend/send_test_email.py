"""
Sends one test email using the SMTP settings in backend/.env and
prints exactly why it failed if it does.

Usage (from the project root):
    python -m backend.send_test_email               # to RECIPIENT_EMAIL
    python -m backend.send_test_email you@gmail.com # to another address
"""

from __future__ import annotations

import smtplib
import ssl
import sys
from email.message import EmailMessage
from email.utils import formataddr

from . import lib


def main() -> int:
    to = sys.argv[1] if len(sys.argv) > 1 else lib.RECIPIENT_EMAIL
    if not lib.SMTP_HOST:
        print("SMTP_HOST is empty in backend/.env, so emails only go to data/outbox.log.")
        return 1
    if lib.SMTP_USER and not lib.SMTP_PASSWORD:
        print("SMTP_PASSWORD is empty in backend/.env. Add the mailbox password and try again.")
        return 1

    msg = EmailMessage()
    msg["From"] = formataddr(("Forth Ledger Website", lib.MAIL_FROM))
    msg["To"] = to
    msg["Subject"] = "Test email from the Forth Ledger website"
    msg.set_content("If you can read this, the consultation form can send email.")

    print(f"Connecting to {lib.SMTP_HOST}:{lib.SMTP_PORT} ({lib.SMTP_SECURITY}) as {lib.SMTP_USER or '(no login)'}...")
    try:
        if lib.SMTP_SECURITY == "ssl":
            server: smtplib.SMTP = smtplib.SMTP_SSL(
                lib.SMTP_HOST, lib.SMTP_PORT, timeout=lib.SMTP_TIMEOUT, context=ssl.create_default_context()
            )
        else:
            server = smtplib.SMTP(lib.SMTP_HOST, lib.SMTP_PORT, timeout=lib.SMTP_TIMEOUT)
        with server:
            if lib.SMTP_SECURITY == "starttls":
                server.starttls(context=ssl.create_default_context())
            if lib.SMTP_USER:
                server.login(lib.SMTP_USER, lib.SMTP_PASSWORD)
            server.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        print("FAILED: the mail server rejected the username/password. Check SMTP_USER and SMTP_PASSWORD.")
        return 1
    except Exception as exc:
        print(f"FAILED: {type(exc).__name__}: {exc}")
        return 1

    print(f"Sent. Check the inbox (and spam folder) of {to}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
