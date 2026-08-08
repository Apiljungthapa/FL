<?php
/**
 * Consultation form handler.
 * Deploy this whole php-api/ folder to your cPanel hosting (e.g. as
 * public_html/api/) and point the site's form at /api/consult.php.
 * See php-api/README.md for setup steps.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

// ---- Config: edit these two lines for your domain ----
const RATE_LIMIT_MAX    = 5;    // max submissions
const RATE_LIMIT_WINDOW = 600;  // per this many seconds, per IP
const MAX_FIELD_LEN     = 3000;
const ALLOWED_REGIONS   = ['United States', 'United Kingdom', 'Europe', 'Asia Pacific', 'Middle East', 'Others'];

// ---- Hardening: never leak errors to the client ----
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', DATA_DIR . '/php-error.log');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function ok(array $extra = []): void {
    echo json_encode(array_merge(['success' => true], $extra));
    exit;
}

// ---- Method check ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed');
}

// ---- Parse body: accept JSON or classic form submission ----
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw ?: '', true);
    if (!is_array($input)) {
        fail(400, 'Invalid request body');
    }
} else {
    $input = $_POST;
}

// ---- Honeypot: real users never fill this hidden field ----
if (!empty($input['website'])) {
    // Pretend success so bots don't learn to avoid the trap.
    ok();
}

// ---- Fill-speed check: real people take at least a couple seconds
// to read and fill the form; scripted submitters typically post
// within milliseconds of loading the page. ----
$elapsedMs = (int)($input['elapsedMs'] ?? 0);
if ($elapsedMs > 0 && $elapsedMs < 2000) {
    // Pretend success so bots don't learn to slow down.
    ok();
}

// ---- Rate limit by IP ----
ensureDataDir();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ipHash = hash('sha256', $ip);
$rateFile = DATA_DIR . '/ratelimit_' . $ipHash . '.json';

$now = time();
$timestamps = [];
$fp = fopen($rateFile, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
    $existing = stream_get_contents($fp);
    $decoded = json_decode($existing ?: '[]', true);
    if (is_array($decoded)) {
        $timestamps = array_filter($decoded, fn($t) => $now - $t < RATE_LIMIT_WINDOW);
    }
    if (count($timestamps) >= RATE_LIMIT_MAX) {
        flock($fp, LOCK_UN);
        fclose($fp);
        fail(429, 'Too many requests. Please try again later.');
    }
    $timestamps[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($timestamps)));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ---- Validate & sanitize fields ----
$name    = clean((string)($input['name'] ?? ''), 200);
$email   = clean((string)($input['email'] ?? ''), 200);
$company = clean((string)($input['company'] ?? ''), 200);
$region  = clean((string)($input['region'] ?? ''), 100);
$message = clean((string)($input['message'] ?? ''), MAX_FIELD_LEN);

if ($name === '' || mb_strlen($name) < 2) {
    fail(422, 'Please enter your full name.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'Please enter a valid email address.');
}
if (!in_array($region, ALLOWED_REGIONS, true)) {
    fail(422, 'Please select a region.');
}
if ($message === '') {
    fail(422, 'Please tell us what you need help with.');
}

// ---- Compose a plain-text email. From is always our own domain;
// the visitor's address only ever appears in Reply-To. ----
$subject = 'New consultation request' . ($company !== '' ? ' — ' . $company : '');

$bodyLines = [
    'New consultation request from the website',
    '',
    'Name:    ' . $name,
    'Email:   ' . $email,
    'Company: ' . ($company !== '' ? $company : '-'),
    'Region:  ' . ($region !== '' ? $region : '-'),
    '',
    'Message:',
    $message !== '' ? $message : '(none provided)',
    '',
    '---',
    'Submitted: ' . date('Y-m-d H:i:s T'),
    'IP hash:   ' . substr($ipHash, 0, 12),
];
$body = implode("\n", $bodyLines);

$safeName = str_replace(['"', '<', '>'], '', $name);
$headers = [
    'From: Forth Ledger Website <' . MAIL_FROM . '>',
    'Reply-To: "' . $safeName . '" <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

// ---- Local backup log, in case mail delivery fails ----
$logLine = json_encode([
    'time' => date('c'),
    'name' => $name,
    'email' => $email,
    'company' => $company,
    'region' => $region,
    'message' => $message,
    'mail_sent' => $sent,
]) . "\n";
@file_put_contents(DATA_DIR . '/submissions.log', $logLine, FILE_APPEND | LOCK_EX);

// ---- Confirm to the submitter that we received their request ----
// Best-effort and never blocks the response above: if mail is down
// right now, this gets queued and retry_confirmations.php (run on a
// cPanel cron schedule) keeps trying until it succeeds.
sendOrQueueConfirmation($name, $email);

if (!$sent) {
    // We still saved it to the log above, so the lead isn't lost.
    fail(502, 'Could not send email right now, please try again or email us directly.');
}

ok();
