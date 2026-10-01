<?php
declare(strict_types=1);

namespace HambakTech\Config;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Authoritative MySQL Database Connection Manager
 * Fails safely if MySQL is unavailable — never fakes transaction success.
 */
class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $host = Env::get('DB_HOST', '127.0.0.1');
        $port = Env::getInt('DB_PORT', 3306);
        $name = Env::get('DB_NAME', Env::get('DB_DATABASE', 'hambaktech'));
        $user = Env::get('DB_USER', Env::get('DB_USERNAME', 'root'));
        $pass = Env::get('DB_PASSWORD', '');

        // Support DATABASE_URL if individual variables are not set
        $dbUrl = Env::get('DATABASE_URL');
        if ($dbUrl && str_starts_with($dbUrl, 'mysql://')) {
            $parsed = parse_url($dbUrl);
            if ($parsed !== false) {
                $host = $parsed['host'] ?? $host;
                $port = isset($parsed['port']) ? (int)$parsed['port'] : $port;
                $user = $parsed['user'] ?? $user;
                $pass = $parsed['pass'] ?? $pass;
                if (isset($parsed['path'])) {
                    $name = ltrim($parsed['path'], '/');
                }
            }
        }

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        try {
            self::$connection = new PDO($dsn, $user, $pass, $options);
            return self::$connection;
        } catch (PDOException $e) {
            // Strict fail-safe: Log error without exposing credentials, then throw RuntimeException
            error_log("[HambakTech DB Error] Unable to connect to MySQL database: " . $e->getMessage());
            throw new RuntimeException("Database service is currently unreachable. Transactions halted safely.", 503, $e);
        }
    }

    public static function isConnected(): bool
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1");
            return $stmt !== false;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Executes a callback within a strict ACID transaction.
     * Supports nested callers without throwing PDO "already an active transaction" exceptions.
     */
    public static function transaction(callable $callback): mixed
    {
        $pdo = self::getConnection();
        $isRoot = !$pdo->inTransaction();
        if ($isRoot) {
            $pdo->beginTransaction();
        }
        try {
            $result = $callback($pdo);
            if ($isRoot && $pdo->inTransaction()) {
                $pdo->commit();
            }
            return $result;
        } catch (\Throwable $e) {
            if ($isRoot && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }
}
