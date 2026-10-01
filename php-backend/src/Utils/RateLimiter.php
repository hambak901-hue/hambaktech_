<?php
declare(strict_types=1);

namespace HambakTech\Utils;

use HambakTech\Config\Env;

/**
 * Sliding-Window In-Memory / File-Backed Rate Limiter
 */
class RateLimiter
{
    private static string $storageDir = '';

    private static function getStorageDir(): string
    {
        if (self::$storageDir === '') {
            $base = dirname(__DIR__, 2) . '/storage/cache/rate_limit';
            if (!is_dir($base)) {
                @mkdir($base, 0755, true);
            }
            self::$storageDir = $base;
        }
        return self::$storageDir;
    }

    /**
     * Checks whether a request should be rate-limited.
     * Returns true if allowed, false if limit exceeded.
     */
    public static function check(string $identifier, int $maxRequests = 5, int $windowSeconds = 900): bool
    {
        $dir = self::getStorageDir();
        $safeKey = preg_replace('/[^a-zA-Z0-9_-]/', '_', $identifier);
        $file = "{$dir}/rl_{$safeKey}.json";

        $now = time();
        $timestamps = [];

        if (file_exists($file)) {
            $data = @file_get_contents($file);
            if ($data !== false) {
                $decoded = json_decode($data, true);
                if (is_array($decoded)) {
                    $timestamps = array_filter($decoded, fn($ts) => is_int($ts) && ($now - $ts) < $windowSeconds);
                }
            }
        }

        if (count($timestamps) >= $maxRequests) {
            return false;
        }

        $timestamps[] = $now;
        @file_put_contents($file, json_encode(array_values($timestamps)), LOCK_EX);
        return true;
    }

    public static function getClientIp(): string
    {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return (string) $_SERVER['HTTP_CF_CONNECTING_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($parts[0]);
        }
        return (string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    }
}
