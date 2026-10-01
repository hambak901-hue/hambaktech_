<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Services\AuthService;
use HambakTech\Utils\Response;
use RuntimeException;

abstract class BaseController
{
    protected AuthService $authService;

    public function __construct(?AuthService $authService = null)
    {
        $this->authService = $authService ?? new AuthService();
    }

    protected function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new RuntimeException("Malformed JSON payload.", 400);
        }
        return $data;
    }

    protected function getAuthUser(): array
    {
        return $this->authService->authenticateRequest();
    }

    protected function isSuperAdmin(?array $user = null): bool
    {
        $u = $user ?? $this->getAuthUser();
        $role = strtolower(trim((string)($u['roleSlug'] ?? $u['role'] ?? '')));
        return $role === 'super_admin';
    }

    protected function isAdmin(?array $user = null): bool
    {
        $u = $user ?? $this->getAuthUser();
        $role = strtolower(trim((string)($u['roleSlug'] ?? $u['role'] ?? '')));
        return in_array($role, ['super_admin', 'admin'], true);
    }

    protected function isStaff(?array $user = null): bool
    {
        $u = $user ?? $this->getAuthUser();
        $role = strtolower(trim((string)($u['roleSlug'] ?? $u['role'] ?? '')));
        return in_array($role, ['super_admin', 'admin', 'staff', 'customer_service'], true);
    }

    protected function requireRoles(array $allowedRoles): array
    {
        $user = $this->getAuthUser();
        $roleSlug = strtolower(trim((string)($user['roleSlug'] ?? $user['role'] ?? '')));
        
        // Super Admin has universal access
        if ($roleSlug === 'super_admin') {
            return $user;
        }

        $normalizedAllowed = array_map(fn($r) => strtolower(trim((string)$r)), $allowedRoles);
        if (!in_array($roleSlug, $normalizedAllowed, true)) {
            Response::forbidden("Access denied. Required role: " . implode(', ', $allowedRoles));
        }
        return $user;
    }

    protected function requirePermission(string $permissionSlug): array
    {
        $user = $this->getAuthUser();
        $this->authService->assertPermission($user, $permissionSlug);
        return $user;
    }
}
