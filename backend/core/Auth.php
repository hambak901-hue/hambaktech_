<?php
declare(strict_types=1);

namespace HambakTech\Core;

/**
 * Authoritative Authentication & Cryptographic Core
 * Production Authority: PHP 8.1+ / MySQL 8.x
 */
class Auth
{
    /**
     * Reorders Argon2id/Argon2i parameters from Node.js (m=65536,p=4,t=3)
     * to the standard PHP order (m=65536,t=3,p=4).
     */
    public static function normalizeArgon2Hash(string $hash): string
    {
        if (!str_starts_with($hash, '$argon2')) {
            return $hash;
        }

        if (preg_match('/^(\$argon2(?:id|i)?\$v=\d+\$)([^$]+)(\$.*)$/', $hash, $matches)) {
            $prefix = $matches[1];
            $paramStr = $matches[2];
            $suffix = $matches[3];

            $params = [];
            foreach (explode(',', $paramStr) as $pair) {
                $kv = explode('=', $pair, 2);
                if (count($kv) === 2) {
                    $params[$kv[0]] = $kv[1];
                }
            }

            // Standard PHP password_verify expects m, t, p
            $ordered = [];
            if (isset($params['m'])) $ordered[] = "m={$params['m']}";
            if (isset($params['t'])) $ordered[] = "t={$params['t']}";
            if (isset($params['p'])) $ordered[] = "p={$params['p']}";
            foreach ($params as $k => $v) {
                if (!in_array($k, ['m', 't', 'p'], true)) {
                    $ordered[] = "{$k}={$v}";
                }
            }

            return $prefix . implode(',', $ordered) . $suffix;
        }

        return $hash;
    }

    /**
     * Production Target: Argon2id (memory_cost = 65536 KiB, time_cost = 3, threads/parallelism = 4)
     */
    public static function hashPassword(string $password): string
    {
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536, // 64 MiB
                'time_cost'   => 3,
                'threads'     => 4,
            ]);
        }
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Cross-runtime Password Verification supporting:
     * 1. Standard and parameter-reordered Argon2id ($argon2id$v=19$m=65536,p=4,t=3 -> m=65536,t=3,p=4)
     * 2. PBKDF2-HMAC-SHA512 (pbkdf2_sha512$100000$salt$hash and pbkdf2$100000$salt$hash)
     * 3. Bcrypt and standard Argon2
     */
    public static function verifyPassword(string $password, string $storedHash): bool
    {
        if (empty($password) || empty($storedHash)) {
            return false;
        }

        // 1. PBKDF2 Cross-compatibility
        if (str_starts_with($storedHash, 'pbkdf2_sha512$') || str_starts_with($storedHash, 'pbkdf2$')) {
            $parts = explode('$', $storedHash);
            if (count($parts) === 4) {
                $iterations = (int) $parts[1];
                $salt = $parts[2];
                $expectedHash = $parts[3];
                $expectedLen = strlen($expectedHash);

                $computed = hash_pbkdf2('sha512', $password, $salt, $iterations, $expectedLen);
                if (hash_equals($expectedHash, $computed)) {
                    return true;
                }

                if (ctype_xdigit($salt) && strlen($salt) % 2 === 0) {
                    $rawSalt = hex2bin($salt);
                    if ($rawSalt !== false) {
                        $computedRaw = hash_pbkdf2('sha512', $password, $rawSalt, $iterations, $expectedLen);
                        if (hash_equals($expectedHash, $computedRaw)) {
                            return true;
                        }
                    }
                }
            }
        }

        // 2. Argon2id / Argon2i with parameter normalization
        if (str_starts_with($storedHash, '$argon2')) {
            if (@password_verify($password, $storedHash)) {
                return true;
            }
            $normalized = self::normalizeArgon2Hash($storedHash);
            if ($normalized !== $storedHash && @password_verify($password, $normalized)) {
                return true;
            }
        }

        // 3. Bcrypt / Standard PHP password_verify
        return @password_verify($password, $storedHash);
    }

    /**
     * Checks if password hash needs rehash to the authoritative Argon2id standard.
     */
    public static function needsRehash(string $storedHash): bool
    {
        if (!str_starts_with($storedHash, '$argon2id$')) {
            return true;
        }
        return password_needs_rehash($storedHash, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost'   => 3,
            'threads'     => 4,
        ]);
    }

    public static function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
