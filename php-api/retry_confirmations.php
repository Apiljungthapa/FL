<?php
/**
 * Retries queued "we received your request" confirmation emails.
 *
 * consult.php sends this immediately when someone submits the form;
 * if that immediate send fails (mail server down, etc.) it queues
 * the confirmation to data/confirmation_queue.json instead of
 * dropping it. This script is meant to run on a cPanel cron
 * schedule (e.g. every 10-15 minutes) to keep retrying until each
 * one succeeds or ages out. See README.md for the cron setup.
 *
 * CLI only — running this over the web would let anyone trigger it
 * and burn through the queue's retry budget early.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

require __DIR__ . '/lib.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', DATA_DIR . '/php-error.log');

ensureDataDir();

$fp = fopen(CONFIRMATION_QUEUE, 'c+');
if (!$fp) {
    fwrite(STDERR, "Could not open confirmation queue\n");
    exit(1);
}
if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    fwrite(STDERR, "Could not lock confirmation queue\n");
    exit(1);
}

$existing = stream_get_contents($fp);
$queue = json_decode($existing ?: '[]', true);
if (!is_array($queue)) {
    $queue = [];
}

$remaining = [];
$sentCount = 0;
$droppedCount = 0;

foreach ($queue as $item) {
    $name = clean((string)($item['name'] ?? ''), 200);
    $email = clean((string)($item['email'] ?? ''), 200);
    $attempts = (int)($item['attempts'] ?? 0);

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Corrupt entry — nothing useful to retry.
        continue;
    }

    [$subject, $body, $headers] = confirmationEmail($name);
    $sent = @mail($email, $subject, $body, $headers);

    if ($sent) {
        $sentCount++;
        continue;
    }

    $attempts++;
    if ($attempts >= CONFIRMATION_MAX_ATTEMPTS) {
        $droppedCount++;
        @file_put_contents(
            DATA_DIR . '/confirmation_failures.log',
            json_encode([
                'time' => date('c'),
                'name' => $name,
                'email' => $email,
                'attempts' => $attempts,
            ]) . "\n",
            FILE_APPEND | LOCK_EX
        );
        continue;
    }

    $remaining[] = [
        'name' => $name,
        'email' => $email,
        'attempts' => $attempts,
        'queued_at' => $item['queued_at'] ?? time(),
    ];
}

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode(array_values($remaining)));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo "Confirmation retry: sent {$sentCount}, gave up on {$droppedCount}, "
    . count($remaining) . " still queued.\n";
