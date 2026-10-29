"""
Retries queued "we received your request" confirmation emails.

The /api/consult endpoint sends this immediately when someone submits
the form; if that immediate send fails (mail server down, etc.) it
queues the confirmation to data/confirmation_queue.json instead of
dropping it. This script is meant to run on a cron schedule (e.g.
every 10-15 minutes) to keep retrying until each one succeeds or ages
out. See README.md for the cron setup.

CLI only — it is not exposed over HTTP, so a random visitor can't
trigger it and burn through the queue's retry budget early.

Usage:  python -m backend.retry_confirmations
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime

from .lib import (
    CONFIRMATION_MAX_ATTEMPTS,
    CONFIRMATION_QUEUE,
    DATA_DIR,
    append_line,
    clean,
    is_valid_email,
    send_confirmation,
    update_json_list,
)


def main() -> int:
    counts = {"sent": 0, "dropped": 0, "remaining": 0}

    def process(queue: list) -> list:
        remaining = []
        for item in queue:
            if not isinstance(item, dict):
                continue
            name = clean(str(item.get("name") or ""), 200)
            email = clean(str(item.get("email") or ""), 200)
            try:
                attempts = int(item.get("attempts") or 0)
            except (TypeError, ValueError):
                attempts = 0

            if name == "" or not is_valid_email(email):
                # Corrupt entry — nothing useful to retry.
                continue

            if send_confirmation(name, email):
                counts["sent"] += 1
                continue

            attempts += 1
            if attempts >= CONFIRMATION_MAX_ATTEMPTS:
                counts["dropped"] += 1
                append_line(
                    DATA_DIR / "confirmation_failures.log",
                    json.dumps(
                        {
                            "time": datetime.now().astimezone().isoformat(timespec="seconds"),
                            "name": name,
                            "email": email,
                            "attempts": attempts,
                        },
                        ensure_ascii=False,
                    ),
                )
                continue

            remaining.append(
                {
                    "name": name,
                    "email": email,
                    "attempts": attempts,
                    "queued_at": item.get("queued_at") or int(time.time()),
                }
            )
        counts["remaining"] = len(remaining)
        return remaining

    try:
        update_json_list(CONFIRMATION_QUEUE, process)
    except OSError as exc:
        print(f"Could not open confirmation queue: {exc}", file=sys.stderr)
        return 1

    print(
        f"Confirmation retry: sent {counts['sent']}, gave up on {counts['dropped']}, "
        f"{counts['remaining']} still queued."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
