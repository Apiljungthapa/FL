# Consultation form backend

A PHP endpoint that emails you when someone submits the "Book my
consultation" form — and emails the submitter back to confirm it went
through. No database, no dependencies — works on any cPanel shared
host with PHP (which Cloud Thikka includes).

## Files

- **`lib.php`** — shared config (`RECIPIENT_EMAIL`, `MAIL_FROM`) and
  helpers used by both scripts below. This is where you set your
  email addresses, not `consult.php`.
- **`consult.php`** — the form endpoint the site's frontend posts to.
- **`retry_confirmations.php`** — run on a cPanel cron schedule (see
  below) to retry any confirmation emails that failed to send
  immediately.

## How it protects you

- **Same-origin only.** Deployed under your own domain, so the browser
  never needs CORS and no other site can call it.
- **Honeypot field** silently drops bot submissions.
- **Rate limiting** — 5 submissions per IP per 10 minutes, enforced
  server-side via a local file, so a script can't hammer your inbox.
- **Input sanitized** before it ever reaches an email body or a log
  file — strips control characters and newlines, so nobody can inject
  extra email headers or corrupt the log.
- **`From:` is always your own domain**, the visitor's address only
  ever appears in `Reply-To`. This avoids your mail getting flagged as
  spoofed/spam, which is the #1 reason contact-form mail goes missing.
- **No error detail is ever sent to the browser** — real errors go to
  `data/php-error.log` on the server only.
- **`data/` is walled off** by its own `.htaccess` (`Require all
  denied`), so the submission log, rate-limit files, and confirmation
  queue can't be fetched directly even if someone guesses the path.

## What happens on a submission

1. The lead is validated, rate-limit checked, and emailed to
   `RECIPIENT_EMAIL` — this part is unchanged and still the one thing
   that decides whether the browser sees success or failure.
2. It's saved to `data/submissions.log` regardless, so a lead is never
   lost even if step 1's email fails to send.
3. The submitter gets a short "we received your request" confirmation
   email, sent immediately. **This step never affects the response
   the browser sees** — it's entirely best-effort.
4. If that confirmation email fails to send right then (mail server
   temporarily down, etc.), it's queued to
   `data/confirmation_queue.json` instead of being dropped.
   `retry_confirmations.php`, run on a cron schedule, keeps retrying
   each queued entry until it succeeds or hits
   `CONFIRMATION_MAX_ATTEMPTS` (20 tries — a few hours of coverage at
   a 10-15 minute cron interval), at which point it gives up and logs
   it to `data/confirmation_failures.log` so you can follow up
   manually if needed.

## Requirements

PHP 8.0+. In cPanel, go to **MultiPHP Manager** and confirm your
domain is set to PHP 8.0 or newer before deploying (most Cloud Thikka
accounts default to a recent version already).

## Deploy

1. In cPanel File Manager (or FTP), upload this whole `php-api/`
   folder into `public_html/api/`, so the endpoint ends up at
   `https://yourdomain.com/api/consult.php`.
2. Open **`lib.php`** and check `RECIPIENT_EMAIL` and `MAIL_FROM` —
   both default to `connect@forthledger.com`, so no new mailbox needs
   to be created. You don't need the password to that inbox for this
   to work: `From:` is just a header the script writes, not something
   requiring login access. The only requirement is that the domain
   (`forthledger.com`) matches the server sending it, which it will
   once this is deployed on your own hosting. Do not point `MAIL_FROM`
   at a Gmail/Yahoo address — mail servers reject a `From:` that
   doesn't match the sending domain.
3. Make sure `public_html/api/data/` is writable by PHP (cPanel's
   default `755`/`750` on a fresh upload is fine — the scripts create
   the folder themselves with `0700` if it's missing).
4. Visit `https://yourdomain.com/api/consult.php` directly in a
   browser — you should see `{"success":false,"error":"Method not
   allowed"}`. That confirms the script is live (GET is rejected on
   purpose; only the form's POST works).
5. Submit the real form on your site and confirm both emails arrive:
   the lead notification at `RECIPIENT_EMAIL`, and the confirmation at
   the address you submitted with. If either is missing, check
   `public_html/api/data/submissions.log` — the lead is saved there
   even when email delivery fails — and `php-error.log` next to it.
6. **Set up the cron job** so queued confirmation emails actually get
   retried (skip this and a confirmation that fails once is gone for
   good instead of being retried):
   - cPanel → **Cron Jobs**
   - Common Settings: **Every 15 Minutes**
   - Command:
     ```
     php /home/YOURUSERNAME/public_html/api/retry_confirmations.php
     ```
     (cPanel's Cron Jobs page shows your home directory path — use
     that instead of guessing `YOURUSERNAME`.)
   - Save. You can test it immediately over SSH/Terminal with the
     same command; it prints a one-line summary like `Confirmation
     retry: sent 1, gave up on 0, 0 still queued.`

## Notes

- `data/submissions.log` is a plain-text backup of every lead, and
  `data/confirmation_queue.json` / `confirmation_failures.log` hold
  names and emails too. Treat all of them as sensitive — they're
  already blocked from web access, but don't email them around
  unencrypted.
- `retry_confirmations.php` refuses to run over HTTP (only works from
  the command line/cron) so it can't be triggered by a random visitor
  hitting the URL.
- If leads or confirmations start landing in spam, ask your host to
  confirm SPF/DKIM are set up for your domain (Cloud Thikka's cPanel
  usually has an "Email Deliverability" page that shows this) — the
  scripts' `From:` address does the rest correctly on its own.
