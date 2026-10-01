<?php
declare(strict_types=1);

namespace HambakTech\Utils;

/**
 * Bank-Grade Cryptographic & Security Utilities
 */
class Security
{
    /**
     * Normalizes Argon2id/Argon2i hash parameter ordering.
     * Node.js/Prisma hashes often output m=65536,p=4,t=3 while standard PHP expects m=65536,t=3,p=4.
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
     * Authoritative Argon2id Password Hashing
     * Target: memory_cost = 65536 KiB, time_cost = 3, threads = 4
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
     * Verifies password against Argon2id (with Node/PHP parameter ordering normalization),
     * PBKDF2 cross-runtime hashes, and standard Bcrypt.
     */
    public static function verifyPassword(string $password, string $storedHash): bool
    {
        if (empty($password) || empty($storedHash)) {
            return false;
        }

        // 1. Check PBKDF2 formats (pbkdf2_sha512$... or pbkdf2$...)
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

        // 3. Bcrypt and standard PHP password_verify
        return @password_verify($password, $storedHash);
    }

    /**
     * Checks if a password hash should be seamlessly upgraded to standard Argon2id.
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

    /**
     * Generates a 64-character high-entropy cryptographic token.
     */
    public static function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Generates a fast SHA-256 token hash for secure database storage.
     */
    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Generates a 6-digit cryptographically secure numeric OTP.
     */
    public static function generateOtp(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Hashes an OTP with SHA-256 for database storage.
     */
    public static function hashOtp(string $otp): string
    {
        return hash('sha256', $otp);
    }

    /**
     * Constant-time HMAC-SHA512 webhook signature verification.
     */
    public static function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $computed = hash_hmac('sha512', $payload, $secret);
        return hash_equals($computed, $signature);
    }

    /**
     * Path traversal protection and filename sanitization.
     */
    public static function sanitizeFilename(string $filename): string
    {
        // Strip null bytes and directory separators
        $cleaned = str_replace(["\0", '../', '..\\', '/', '\\'], '', $filename);
        $cleaned = preg_replace('/[^a-zA-Z0-9._-]/', '_', $cleaned) ?? 'file';
        return $cleaned;
    }

    /**
     * Sanitizes general string input.
     */
    public static function sanitizeString(?string $input): string
    {
        if ($input === null) {
            return '';
        }
        return trim(htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8'));
    }
}
