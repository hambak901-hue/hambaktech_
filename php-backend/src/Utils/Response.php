<?php
declare(strict_types=1);

namespace HambakTech\Utils;

/**
 * Standardized JSON API Response Helper
 */
class Response
{
    public static function json(
        mixed $data = null,
        int $statusCode = 200,
        string $message = 'Operation completed successfully.',
        bool $success = true,
        ?array $error = null
    ): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');

        $payload = [
            'success'   => $success,
            'message'   => $message,
            'data'      => $data,
            'timestamp' => date('c'),
        ];

        if (!$success && $error !== null) {
            $payload['error'] = $error;
        }

        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void
    {
        self::json($data, $statusCode, $message, true);
    }

    public static function error(
        string $message,
        int $statusCode = 400,
        string $errorCode = 'BAD_REQUEST',
        mixed $details = null
    ): void {
        self::json(
            data: null,
            statusCode: $statusCode,
            message: $message,
            success: false,
            error: [
                'code'    => $errorCode,
                'message' => $message,
                'details' => $details,
            ]
        );
    }

    public static function unauthorized(string $message = 'Authentication required'): void
    {
        self::error($message, 401, 'UNAUTHORIZED');
    }

    public static function forbidden(string $message = 'Access denied'): void
    {
        self::error($message, 403, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Resource not found', array $details = []): void
    {
        self::error($message, 404, 'NOT_FOUND', $details);
    }

    public static function tooManyRequests(string $message = 'Too many requests. Please try again later.', int $retryAfter = 60): void
    {
        header("Retry-After: {$retryAfter}");
        self::error($message, 429, 'RATE_LIMIT_EXCEEDED', ['retryAfter' => $retryAfter]);
    }

    public static function serverError(string $message = 'An internal server error occurred'): void
    {
        self::error($message, 500, 'INTERNAL_SERVER_ERROR');
    }
}
