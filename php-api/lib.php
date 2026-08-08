<?php
/**
 * Shared config and helpers for the consultation form backend
 * (consult.php) and its background confirmation-email retry job
 * (retry_confirmations.php). See README.md.
 */

declare(strict_types=1);

// ---- Config: edit these two lines for your domain ----
const RECIPIENT_EMAIL = 'connect@forthledger.com';
const MAIL_FROM        = 'connect@forthledger.com'; // reuses your existing mailbox, no new one needed

const DATA_DIR = __DIR__ . '/data';
const CONFIRMATION_QUEUE = DATA_DIR . '/confirmation_queue.json';
// ~ a few hours of coverage at a 10-15 minute cron interval before we
// give up on a single confirmation and log it as a permanent failure.
const CONFIRMATION_MAX_ATTEMPTS = 20;

// Strip control/newline characters so nothing can end up injecting
// extra headers or corrupting a log file, regardless of where a
// field is later used.
function clean(string $value, int $maxLen = 3000): string {
    $value = str_replace(["\r", "\n", "\0"], ' ', $value);
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $value));
    return mb_substr($value, 0, $maxLen);
}

function ensureDataDir(): void {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0700, true);
    }
}

// Builds the short "we received your request" email sent to the
// person who filled out the form. Reply-To points back at our own
// inbox so a reply from them reaches us, not a no-reply address.
function confirmationEmail(string $name): array {
    $subject = "We've received your request \xe2\x80\x94 Forth Ledger";
    $body = implode("\n", [
        "Hi {$name},",
        '',
        "Thanks for reaching out to Forth Ledger. We've received your consultation request and will get back to you within one business day.",
        '',
        "If anything changes on your end in the meantime, just reply to this email.",
        '',
        '— The Forth Ledger team',
    ]);
    $headers = [
        'From: Forth Ledger <' . MAIL_FROM . '>',
        'Reply-To: ' . RECIPIENT_EMAIL,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
    ];
    return [$subject, $body, implode("\r\n", $headers)];
}

// Best-effort send: tries once immediately so most submitters get
// the confirmation right away. If the mail server is down or the
// send otherwise fails, the confirmation is queued to disk instead
// of being dropped — retry_confirmations.php (run on a cPanel cron
// schedule) works through that queue until it succeeds or the entry
// ages out. Never throws; failure here must never affect the form's
// own success response.
function sendOrQueueConfirmation(string $name, string $email): bool {
    [$subject, $body, $headers] = confirmationEmail($name);
    $sent = @mail($email, $subject, $body, $headers);
    if (!$sent) {
        queueConfirmation($name, $email);
    }
    return $sent;
}

function queueConfirmation(string $name, string $email): void {
    ensureDataDir();
    $fp = fopen(CONFIRMATION_QUEUE, 'c+');
    if (!$fp) {
        return;
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }
    $existing = stream_get_contents($fp);
    $queue = json_decode($existing ?: '[]', true);
    if (!is_array($queue)) {
        $queue = [];
    }
    $queue[] = [
        'name' => $name,
        'email' => $email,
        'attempts' => 0,
        'queued_at' => time(),
    ];
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($queue)));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}
