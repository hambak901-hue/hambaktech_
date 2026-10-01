<?php
declare(strict_types=1);

namespace HambakTech\Config;

/**
 * Environment Configuration Loader
 * Reads from system environment variables or parses a local .env file.
 */
class Env
{
    private static array $cache = [];
    private static bool $loaded = false;

    public static function load(?string $filePath = null): void
    {
        if (self::$loaded && $filePath === null) {
            return;
        }

        $path = $filePath ?? dirname(__DIR__, 2) . '/.env';
        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || str_starts_with($line, '#')) {
                        continue;
                    }
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $key = trim($parts[0]);
                        $value = trim($parts[1]);
                        // Strip surrounding quotes
                        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                            $value = substr($value, 1, -1);
                        }
                        self::$cache[$key] = $value;
                    }
                }
            }
        }
        self::$loaded = true;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        self::load();

        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return (string) $_ENV[$key];
        }
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            return (string) $_SERVER[$key];
        }
        $val = getenv($key);
        if ($val !== false && $val !== '') {
            return (string) $val;
        }
        if (isset(self::$cache[$key])) {
            return self::$cache[$key];
        }
        return $default;
    }

    public static function getInt(string $key, int $default = 0): int
    {
        $val = self::get($key);
        return $val !== null ? (int) $val : $default;
    }

    public static function getBool(string $key, bool $default = false): bool
    {
        $val = strtolower(self::get($key, '') ?? '');
        if (in_array($val, ['true', '1', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($val, ['false', '0', 'no', 'off'], true)) {
            return false;
        }
        return $default;
    }

    public static function isProduction(): bool
    {
        $env = strtolower(self::get('NODE_ENV', self::get('APP_ENV', 'development')) ?? 'development');
        return $env === 'production';
    }
}
