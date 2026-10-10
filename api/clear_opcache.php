<?php
declare(strict_types=1);

header('Content-Type: application/json');

$reset = false;
if (function_exists('opcache_reset')) {
    $reset = @opcache_reset();
}

$status = [];
if (function_exists('opcache_get_status')) {
    $status = @opcache_get_status(false) ?: [];
}

echo json_encode([
    'success' => true,
    'opcache_reset' => $reset,
    'opcache_enabled' => $status['opcache_enabled'] ?? false,
    'scripts_cached' => isset($status['opcache_statistics']) ? $status['opcache_statistics']['num_cached_scripts'] : 0,
    'time' => time(),
]);
