<?php
declare(strict_types=1);

namespace HambakTech;

use HambakTech\Config\Env;
use HambakTech\Utils\Response;
use Throwable;

/**
 * Lightweight High-Performance REST API Router
 */
class Router
{
    private array $routes = [];

    public function addRoute(string $method, string $path, callable|array $handler): void
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => $this->convertPathToRegex($path),
            'path'    => $path,
            'handler' => $handler,
        ];
    }

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function patch(string $path, callable|array $handler): void
    {
        $this->addRoute('PATCH', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function convertPathToRegex(string $path): string
    {
        // Replace {param} with named or positional regex capture groups
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(?string $uri = null, ?string $method = null): void
    {
        // Handle CORS preflight
        $this->handleCors();

        $method = strtoupper($method ?? $_SERVER['REQUEST_METHOD'] ?? 'GET');
        $rawUri = $uri ?? $_SERVER['REQUEST_URI'] ?? '/';
        $parsed = parse_url($rawUri);
        $path = rtrim($parsed['path'] ?? '/', '/');
        if ($path === '') {
            $path = '/';
        }

        // Standardize base path prefix if routed via /api or /index.php
        $normalizedPath = $path;
        if (preg_match('#^/.*?/(api(?:/.*)?)$#', $normalizedPath, $subMatches)) {
            $normalizedPath = '/' . $subMatches[1];
        }
        if (str_starts_with($normalizedPath, '/api/index.php')) {
            $normalizedPath = substr($normalizedPath, strlen('/api/index.php'));
        } elseif (str_starts_with($normalizedPath, '/index.php')) {
            $normalizedPath = substr($normalizedPath, strlen('/index.php'));
        }

        if ($normalizedPath === '') {
            $normalizedPath = '/';
        }

        // Canonical normalization: allow both /api/v1/* and /api/* to route identically
        if (str_starts_with($normalizedPath, '/api/v1/')) {
            $normalizedPath = '/api/' . substr($normalizedPath, strlen('/api/v1/'));
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $normalizedPath, $matches)) {
                $params = array_filter($matches, fn($k) => !is_numeric($k), ARRAY_FILTER_USE_KEY);

                try {
                    $handler = $route['handler'];
                    if (is_array($handler) && is_string($handler[0])) {
                        $controllerClass = $handler[0];
                        $actionMethod = $handler[1];
                        $instance = new $controllerClass();
                        $instance->$actionMethod($params);
                        return;
                    } elseif (is_callable($handler)) {
                        call_user_func($handler, $params);
                        return;
                    }
                } catch (Throwable $e) {
                    $code = $e->getCode();
                    $httpStatus = (is_int($code) && $code >= 400 && $code <= 599) ? $code : 500;
                    Response::error($e->getMessage(), $httpStatus, 'API_ERROR');
                    return;
                }
            }
        }

        Response::notFound("Endpoint not found for [{$method}] {$normalizedPath}");
    }

    private function handleCors(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOriginsConfig = Env::get('CORS_ALLOWED_ORIGINS', '');
        
        $configuredOrigins = array_filter(array_map('trim', explode(',', (string)$allowedOriginsConfig)));
        
        // Authoritative production, business subdomain, and development origins
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $defaultOrigins = [
            'https://business.hambaktech.com.ng',
            'https://www.business.hambaktech.com.ng',
            'https://hambaktech.com.ng',
            'https://www.hambaktech.com.ng',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        if (!empty($host)) {
            $defaultOrigins[] = "https://{$host}";
            $defaultOrigins[] = "http://{$host}";
        }
        
        $allowedOrigins = array_unique(array_merge($defaultOrigins, $configuredOrigins));
        $normalizedAllowed = array_map(fn($o) => rtrim(strtolower((string)$o), '/'), $allowedOrigins);
        $normalizedOrigin = rtrim(strtolower((string)$origin), '/');

        $isAllowed = in_array($normalizedOrigin, $normalizedAllowed, true)
            || str_ends_with($normalizedOrigin, '.hambaktech.com.ng')
            || str_contains($normalizedOrigin, '.run.app')
            || str_contains($normalizedOrigin, 'localhost')
            || str_contains($normalizedOrigin, '127.0.0.1');

        if ($origin && $isAllowed) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        } elseif (!$origin) {
            header('Access-Control-Allow-Origin: *');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Idempotency-Key');
        header('Access-Control-Max-Age: 86400');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
