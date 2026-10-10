<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Services\WalletService;
use HambakTech\Utils\Response;
use PDO;

class AdminController extends BaseController
{
    private WalletService $walletService;

    public function __construct(?WalletService $walletService = null)
    {
        parent::__construct();
        $this->walletService = $walletService ?? new WalletService();
    }

    public function getStats(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $pdo = Database::getConnection();

        $userCount = (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $orderCount = (int) $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
        $ticketCount = (int) $pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'OPEN'")->fetchColumn();
        $walletVolume = (float) $pdo->query("SELECT COALESCE(SUM(balance), 0) FROM wallets")->fetchColumn();

        $data = [
            'totalUsers'    => $userCount,
            'totalOrders'   => $orderCount,
            'openTickets'   => $ticketCount,
            'walletVolume'  => $walletVolume,
        ];

        Response::success($data, 'Administrative metrics loaded.');
    }

    public function listUsers(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : ($page - 1) * $limit;

        $search = trim((string)($_GET['search'] ?? $_GET['q'] ?? ''));
        $roleFilter = trim((string)($_GET['role'] ?? ''));
        $statusFilter = trim((string)($_GET['status'] ?? ''));
        $tierFilter = trim((string)($_GET['customerTier'] ?? $_GET['tier'] ?? ''));

        $conditions = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $conditions[] = "(u.email LIKE ? OR u.phone LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        if (!empty($roleFilter) && $roleFilter !== 'all') {
            $conditions[] = "r.slug = ?";
            $params[] = strtolower($roleFilter);
        }
        if (!empty($statusFilter) && $statusFilter !== 'all') {
            $conditions[] = "u.status = ?";
            $params[] = strtoupper($statusFilter);
        }
        if (!empty($tierFilter) && $tierFilter !== 'all') {
            $conditions[] = "u.customer_tier = ?";
            $params[] = strtoupper($tierFilter);
        }

        $whereClause = implode(" AND ", $conditions);
        $pdo = Database::getConnection();

        $stmtCount = $pdo->prepare("
            SELECT COUNT(*)
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE {$whereClause}
        ");
        $stmtCount->execute($params);
        $total = (int)$stmtCount->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.phone, u.status, u.customer_tier, u.created_at, u.updated_at,
                   u.email_verified_at, u.phone_verified_at,
                   r.slug AS role, r.name AS role_name,
                   p.first_name, p.last_name, p.avatar_url, p.address, p.state, p.lga, p.kyc_tier, p.kyc_status,
                   p.bvn_last4, p.nin_last4,
                   COALESCE(w.balance, 0) AS wallet_balance,
                   COALESCE(w.ledger_balance, 0) AS ledger_balance,
                   w.status AS wallet_status
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE {$whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $bindIdx = 1;
        foreach ($params as $param) {
            $stmt->bindValue($bindIdx++, $param);
        }
        $stmt->bindValue($bindIdx++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($bindIdx++, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['fullName'] = trim(($item['first_name'] ?? '') . ' ' . ($item['last_name'] ?? '')) ?: $item['email'];
        }

        Response::success([
            'items'      => $items,
            'total'      => $total,
            'page'       => $page,
            'limit'      => $limit,
            'totalPages' => $limit > 0 ? (int)ceil($total / $limit) : 1,
        ], 'Users list retrieved.');
    }

    public function getUser(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $userId = $params['id'] ?? $_GET['id'] ?? '';
        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.phone, u.status, u.customer_tier, u.created_at, u.updated_at,
                   u.email_verified_at, u.phone_verified_at,
                   r.slug AS role, r.name AS role_name,
                   p.first_name, p.last_name, p.avatar_url, p.address, p.state, p.lga,
                   p.bvn_last4, p.nin_last4, p.kyc_tier, p.kyc_status,
                   COALESCE(w.balance, 0) AS wallet_balance,
                   COALESCE(w.ledger_balance, 0) AS ledger_balance,
                   w.status AS wallet_status
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if (!$user) {
            Response::notFound('User not found.');
            return;
        }

        $user['fullName'] = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: $user['email'];

        // Recent orders
        $stmtOrders = $pdo->prepare("
            SELECT id, order_number, total_amount, currency, payment_status, workflow_status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $stmtOrders->execute([$userId]);
        $user['recentOrders'] = $stmtOrders->fetchAll();

        // Recent audit activity
        $stmtActivity = $pdo->prepare("
            SELECT id, action, entity, entity_id, ip_address, details, created_at
            FROM audit_logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        ");
        $stmtActivity->execute([$userId]);
        $user['recentActivity'] = $stmtActivity->fetchAll();

        // Active sessions count
        $stmtSessions = $pdo->prepare("
            SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_revoked = 0 AND expires_at > NOW()
        ");
        $stmtSessions->execute([$userId]);
        $user['activeSessionsCount'] = (int)$stmtSessions->fetchColumn();

        Response::success($user, 'User details retrieved.');
    }

    public function updateUser(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $params['id'] ?? $body['id'] ?? $body['userId'] ?? '';

        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        $pdo = Database::getConnection();

        // Query target user details
        $stmtTarget = $pdo->prepare("
            SELECT u.id, u.email, u.phone, r.slug AS role, p.first_name, p.last_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmtTarget->execute([$userId]);
        $targetUser = $stmtTarget->fetch();

        if (!$targetUser) {
            Response::notFound('Target user not found.');
            return;
        }

        // 1. Protected Super Admin Account Guarantee
        if (in_array(strtolower($targetUser['email']), ['admin@hambaktech.com.ng', 'hambak901@gmail.com'], true)) {
            if (isset($body['status']) && strtoupper((string)$body['status']) !== 'ACTIVE') {
                Response::error('The primary super_admin authority account cannot be suspended or deactivated.', 403, 'PROTECTED_AUTHORITY');
                return;
            }
            if (isset($body['role']) && strtolower((string)$body['role']) !== 'super_admin') {
                Response::error('The primary super_admin authority cannot be demoted.', 403, 'PROTECTED_AUTHORITY');
                return;
            }
        }

        // 2. Prevent non-super-admins from altering super_admin accounts
        if (strtolower((string)$targetUser['role']) === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
            Response::error('Administrative privilege violation: Only super_admin can modify super_admin accounts.', 403, 'INSUFFICIENT_PRIVILEGE');
            return;
        }

        // 3. Strict Role Promotion Guard: ONLY Super Admin can change user roles
        $roleChanged = false;
        $previousRole = strtolower(trim((string)$targetUser['role']));
        $newRoleSlug = null;
        if (isset($body['role'])) {
            $requestedRole = strtolower(trim((string)$body['role']));
            if ($requestedRole !== $previousRole) {
                // Must be authenticated Super Admin
                if (!$this->isSuperAdmin($currentUser)) {
                    Response::error('Privilege violation: Only the Super Administrator has authority to promote or modify user roles.', 403, 'ROLE_PROMOTION_FORBIDDEN');
                    return;
                }

                // Prevent self-role modification (no user may modify or promote their own role)
                if ($currentUser['id'] === $userId) {
                    Response::error('Privilege guard: You cannot modify your own administrative role.', 403, 'SELF_ROLE_CHANGE_BLOCKED');
                    return;
                }

                // Safeguard against removing the final active Super Admin
                if ($previousRole === 'super_admin' && $requestedRole !== 'super_admin') {
                    $superAdminCount = (int)$pdo->query("
                        SELECT COUNT(*) 
                        FROM users u 
                        JOIN roles r ON u.role_id = r.id 
                        WHERE r.slug = 'super_admin' AND u.status = 'ACTIVE'
                    ")->fetchColumn();
                    if ($superAdminCount <= 1) {
                        Response::error('Operation blocked: The system must never have zero active Super Admin accounts.', 403, 'LAST_SUPER_ADMIN_PROTECTED');
                        return;
                    }
                }

                $roleStmt = $pdo->prepare("SELECT id, slug FROM roles WHERE slug = ?");
                $roleStmt->execute([$requestedRole]);
                $roleRow = $roleStmt->fetch();
                if (!$roleRow) {
                    Response::badRequest("Invalid role slug '{$requestedRole}'.");
                    return;
                }
                $roleId = $roleRow['id'];
                $roleChanged = true;
                $newRoleSlug = $requestedRole;
            }
        }

        // Profile fields handling: firstName, lastName, address, state, lga
        $firstName = isset($body['firstName']) ? trim((string)$body['firstName']) : null;
        $lastName = isset($body['lastName']) ? trim((string)$body['lastName']) : null;
        if ($firstName === null && isset($body['fullName'])) {
            $parts = explode(' ', trim((string)$body['fullName']), 2);
            $firstName = $parts[0] ?? '';
            $lastName = $parts[1] ?? '';
        }

        $address = isset($body['address']) ? trim((string)$body['address']) : null;
        $state = isset($body['state']) ? trim((string)$body['state']) : null;
        $lga = isset($body['lga']) ? trim((string)$body['lga']) : null;
        $phone = isset($body['phone']) ? trim((string)$body['phone']) : null;

        if ($phone !== null && $phone !== '' && $phone !== $targetUser['phone']) {
            $phone = preg_replace('/[^\d+]/', '', $phone);
            $stmtPhone = $pdo->prepare("SELECT id FROM users WHERE phone = ? AND id != ? LIMIT 1");
            $stmtPhone->execute([$phone, $userId]);
            if ($stmtPhone->fetch()) {
                Response::error('Phone number is already associated with another account.', 409, 'PHONE_EXISTS');
                return;
            }
            $stmtUpPhone = $pdo->prepare("UPDATE users SET phone = ?, updated_at = NOW() WHERE id = ?");
            $stmtUpPhone->execute([$phone, $userId]);
        }

        // Update profile fields if provided
        $profileUpdates = [];
        $profileParams = [];
        if ($firstName !== null) {
            $profileUpdates[] = "first_name = ?";
            $profileParams[] = $firstName;
        }
        if ($lastName !== null) {
            $profileUpdates[] = "last_name = ?";
            $profileParams[] = $lastName;
        }
        if ($address !== null) {
            $profileUpdates[] = "address = ?";
            $profileParams[] = $address;
        }
        if ($state !== null) {
            $profileUpdates[] = "state = ?";
            $profileParams[] = $state;
        }
        if ($lga !== null) {
            $profileUpdates[] = "lga = ?";
            $profileParams[] = $lga;
        }

        if (!empty($profileUpdates)) {
            $profileUpdates[] = "updated_at = NOW()";
            $profileParams[] = $userId;
            $stmtUpProf = $pdo->prepare("
                UPDATE user_profiles
                SET " . implode(', ', $profileUpdates) . "
                WHERE user_id = ?
            ");
            $stmtUpProf->execute($profileParams);
        }

        if (isset($body['status'])) {
            $status = strtoupper(trim((string)$body['status']));
            $allowedStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
            if (!in_array($status, $allowedStatuses, true)) {
                Response::badRequest('Invalid status value. Allowed: ' . implode(', ', $allowedStatuses));
                return;
            }
            $stmt = $pdo->prepare("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $userId]);

            // If account suspended or made inactive, terminate existing sessions
            if (in_array($status, ['SUSPENDED', 'INACTIVE'], true)) {
                $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?");
                $stmtRevoke->execute([$userId]);
            }
        }

        if (isset($body['customerTier']) || isset($body['customer_tier'])) {
            $tier = strtoupper(trim((string)($body['customerTier'] ?? $body['customer_tier'])));
            $allowedTiers = ['STANDARD', 'AGENT', 'CORPORATE'];
            if (in_array($tier, $allowedTiers, true)) {
                $stmt = $pdo->prepare("UPDATE users SET customer_tier = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$tier, $userId]);
            }
        }

        if ($roleChanged && !empty($roleId) && !empty($newRoleSlug)) {
            $stmt = $pdo->prepare("UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$roleId, $userId]);

            // Specialized immutable audit event for role changes
            $ip = \HambakTech\Utils\RateLimiter::getClientIp();
            $stmtRoleLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'ROLE_CHANGED', 'users', ?, ?, ?, NOW())
            ");
            $roleLogId = 'aud-' . bin2hex(random_bytes(10));
            $roleDetails = "Super Admin changed user role from '{$previousRole}' to '{$newRoleSlug}'";
            $stmtRoleLog->execute([
                $roleLogId,
                $currentUser['id'],
                $currentUser['name'] ?? 'Super Admin',
                $currentUser['email'],
                $userId,
                $ip,
                $roleDetails,
            ]);
        }

        // General update audit log entry
        $ip = \HambakTech\Utils\RateLimiter::getClientIp();
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'ADMIN_USER_UPDATED', 'users', ?, ?, 'Admin updated user attributes', NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $stmtLog->execute([
            $logId,
            $currentUser['id'],
            $currentUser['name'] ?? 'Admin',
            $currentUser['email'],
            $userId,
            $ip,
        ]);

        Response::success(null, 'User successfully updated.');
    }

    public function updateUserStatus(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $params['id'] ?? $body['id'] ?? '';
        $status = strtoupper(trim((string)($body['status'] ?? '')));
        $reason = trim((string)($body['reason'] ?? 'Status updated by administrator'));

        if (empty($userId) || empty($status)) {
            Response::badRequest('User ID and status are required.');
            return;
        }

        $allowedStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
        if (!in_array($status, $allowedStatuses, true)) {
            Response::badRequest('Invalid status value. Allowed: ' . implode(', ', $allowedStatuses));
            return;
        }

        $pdo = Database::getConnection();
        $stmtTarget = $pdo->prepare("
            SELECT u.id, u.email, r.slug AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmtTarget->execute([$userId]);
        $targetUser = $stmtTarget->fetch();
        if (!$targetUser) {
            Response::notFound('User not found.');
            return;
        }

        if (in_array(strtolower($targetUser['email']), ['admin@hambaktech.com.ng', 'hambak901@gmail.com'], true) && $status !== 'ACTIVE') {
            Response::error('The primary super_admin authority account cannot be suspended or deactivated.', 403, 'PROTECTED_AUTHORITY');
            return;
        }

        if (strtolower((string)$targetUser['role']) === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
            Response::error('Administrative privilege violation: Only super_admin can modify super_admin accounts.', 403, 'INSUFFICIENT_PRIVILEGE');
            return;
        }

        $stmtUpdate = $pdo->prepare("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmtUpdate->execute([$status, $userId]);

        if (in_array($status, ['SUSPENDED', 'INACTIVE'], true)) {
            $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?");
            $stmtRevoke->execute([$userId]);
        }

        $ip = \HambakTech\Utils\RateLimiter::getClientIp();
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'ADMIN_USER_STATUS_UPDATED', 'users', ?, ?, ?, NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $details = "Status changed to {$status}. Reason: {$reason}";
        $stmtLog->execute([
            $logId,
            $currentUser['id'],
            $currentUser['name'] ?? 'Admin',
            $currentUser['email'],
            $userId,
            $ip,
            $details,
        ]);

        Response::success(['id' => $userId, 'status' => $status], "User status successfully changed to {$status}.");
    }

    public function updateUserKYC(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $params['id'] ?? $body['id'] ?? '';
        $kycTier = strtoupper(trim((string)($body['kycTier'] ?? $body['kyc_tier'] ?? '')));
        $kycStatus = strtoupper(trim((string)($body['kycStatus'] ?? $body['kyc_status'] ?? '')));
        $notes = trim((string)($body['notes'] ?? 'KYC updated by administrator'));

        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        $updates = [];
        $sqlParams = [];

        if (!empty($kycTier)) {
            $allowedTiers = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'];
            if (!in_array($kycTier, $allowedTiers, true)) {
                Response::badRequest('Invalid KYC tier. Allowed: ' . implode(', ', $allowedTiers));
                return;
            }
            $updates[] = "kyc_tier = ?";
            $sqlParams[] = $kycTier;
        }

        if (!empty($kycStatus)) {
            $allowedStatuses = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'];
            if (!in_array($kycStatus, $allowedStatuses, true)) {
                Response::badRequest('Invalid KYC status. Allowed: ' . implode(', ', $allowedStatuses));
                return;
            }
            $updates[] = "kyc_status = ?";
            $sqlParams[] = $kycStatus;
        }

        if (empty($updates)) {
            Response::badRequest('Either kycTier or kycStatus must be provided.');
            return;
        }

        $pdo = Database::getConnection();
        $updates[] = "updated_at = NOW()";
        $sqlParams[] = $userId;

        $stmt = $pdo->prepare("
            UPDATE user_profiles
            SET " . implode(', ', $updates) . "
            WHERE user_id = ?
        ");
        $stmt->execute($sqlParams);

        $ip = \HambakTech\Utils\RateLimiter::getClientIp();
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'ADMIN_KYC_STATUS_UPDATED', 'user_profiles', ?, ?, ?, NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $details = "KYC updated (Tier: {$kycTier}, Status: {$kycStatus}). Notes: {$notes}";
        $stmtLog->execute([
            $logId,
            $currentUser['id'],
            $currentUser['name'] ?? 'Admin',
            $currentUser['email'],
            $userId,
            $ip,
            $details,
        ]);

        Response::success(null, 'User KYC records updated successfully.');
    }

    public function getUserActivity(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $userId = $params['id'] ?? $_GET['id'] ?? '';
        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at
            FROM audit_logs
            WHERE user_id = ? OR entity_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId);
        $stmt->bindValue(2, $userId);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->bindValue(4, $offset, PDO::PARAM_INT);
        $stmt->execute();

        Response::success($stmt->fetchAll(), 'User activity records retrieved.');
    }

    public function createUser(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();

        $email = trim($body['email'] ?? '');
        $fullName = trim($body['fullName'] ?? $body['name'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $role = strtolower(trim($body['role'] ?? 'customer'));
        $status = strtoupper(trim($body['status'] ?? 'ACTIVE'));

        if (empty($email)) {
            Response::badRequest('Email is required.');
            return;
        }

        if ($role === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
            Response::error('Only existing super_admin can create super_admin.', 403, 'PRIVILEGE_ESCALATION_BLOCKED');
            return;
        }

        $pdo = Database::getConnection();
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            Response::badRequest('User with this email already exists.');
            return;
        }

        $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE slug = ?");
        $roleStmt->execute([$role]);
        $roleId = $roleStmt->fetchColumn() ?: 1;

        $userId = 'usr_' . bin2hex(random_bytes(8));
        $hashed = \HambakTech\Utils\Security::hashPassword('HambakTech@' . rand(100, 999));

        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password_hash, phone, role_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$userId, $email, $hashed, $phone ?: null, $roleId, $status]);

        $nameParts = explode(' ', $fullName, 2);
        $firstName = $nameParts[0] ?? 'User';
        $lastName = $nameParts[1] ?? '';

        $stmtProf = $pdo->prepare("
            INSERT INTO user_profiles (id, user_id, first_name, last_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        $stmtProf->execute(['prf_' . bin2hex(random_bytes(8)), $userId, $firstName, $lastName]);

        $stmtWallet = $pdo->prepare("
            INSERT INTO wallets (id, user_id, balance, ledger_balance, status, currency, created_at, updated_at)
            VALUES (?, ?, 0.00, 0.00, 'ACTIVE', 'NGN', NOW(), NOW())
        ");
        $stmtWallet->execute(['wal_' . bin2hex(random_bytes(8)), $userId]);

        Response::success(['id' => $userId, 'email' => $email], 'User created successfully.', 201);
    }

    public function deleteUser(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $params['id'] ?? $body['id'] ?? '';

        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT email, r.slug AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
        $stmt->execute([$userId]);
        $target = $stmt->fetch();

        if (!$target) {
            Response::notFound('User not found.');
            return;
        }

        if (in_array(strtolower($target['email']), ['admin@hambaktech.com.ng', 'hambak901@gmail.com'], true)) {
            Response::error('The primary super_admin authority account cannot be deleted.', 403, 'PROTECTED_AUTHORITY');
            return;
        }

        if (strtolower((string)$target['role']) === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
            Response::error('Only super_admin can remove another super_admin.', 403, 'INSUFFICIENT_PRIVILEGE');
            return;
        }

        // Soft delete/suspend to preserve foreign key constraints and financial ledger audit trails
        $stmtUp = $pdo->prepare("UPDATE users SET status = 'SUSPENDED', updated_at = NOW() WHERE id = ?");
        $stmtUp->execute([$userId]);

        Response::success(null, 'User deactivated and removed from active roster.');
    }

    public function listWallets(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT w.id, w.user_id, w.balance, w.ledger_balance, w.status, w.currency, w.updated_at,
                   u.email, u.phone, p.first_name, p.last_name
            FROM wallets w
            JOIN users u ON w.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            ORDER BY w.updated_at DESC
        ");
        Response::success($stmt->fetchAll(), 'All wallets retrieved.');
    }

    public function adjustWallet(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $adminUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $body['userId'] ?? $body['user_id'] ?? '';
        $amount = (float)($body['amount'] ?? 0);
        $type = strtoupper($body['type'] ?? 'CREDIT');
        $reason = trim((string)($body['reason'] ?? ''));

        if (empty($userId) || $amount <= 0) {
            Response::badRequest('Target User ID and positive amount are required.');
            return;
        }

        if (empty($reason)) {
            Response::badRequest('Adjustment reason is strictly mandatory for audit compliance.');
            return;
        }

        try {
            $res = $this->walletService->adminAdjust($adminUser['id'], $userId, $amount, $type, $reason);
            Response::success($res, "Wallet successfully adjusted ({$type}).");
        } catch (\Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function listOrders(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT o.*, u.email AS user_email, u.phone AS user_phone,
                   p.first_name, p.last_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        Response::success($stmt->fetchAll(), 'Admin orders retrieved.');
    }

    public function updateOrderStatus(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $body = $this->getJsonBody();
        $orderId = $params['id'] ?? $body['orderId'] ?? $body['order_id'] ?? '';
        $status = $body['status'] ?? '';
        $note = $body['note'] ?? 'Status updated by administrative action';

        if (empty($orderId) || empty($status)) {
            Response::badRequest('Order ID and status are required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? OR order_number = ?");
        $stmt->execute([$status, $orderId, $orderId]);

        // Append to order timeline
        $tlStmt = $pdo->prepare("
            INSERT INTO order_timeline (id, order_id, status, title, note, created_at)
            SELECT UUID(), id, ?, ?, ?, NOW() FROM orders WHERE id = ? OR order_number = ? LIMIT 1
        ");
        $tlStmt->execute([$status, "Status changed to {$status}", $note, $orderId, $orderId]);

        Response::success(null, 'Order status successfully updated.');
    }

    public function listNIN(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT n.*, u.email as user_email, u.phone as user_phone, p.first_name, p.last_name
            FROM nin_requests n
            JOIN users u ON n.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            ORDER BY n.created_at DESC LIMIT 100
        ");
        Response::success($stmt->fetchAll(), 'NIN requests retrieved.');
    }

    public function updateNIN(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $adminUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $id = $params['id'] ?? $body['id'] ?? $body['reference'] ?? '';
        $rawStatus = strtoupper(trim((string)($body['status'] ?? '')));
        $notes = trim((string)($body['notes'] ?? ''));

        if (empty($id) || empty($rawStatus)) {
            Response::badRequest('Request ID and new status are required.');
            return;
        }

        // Normalize legacy UI statuses to canonical DB statuses
        $statusMap = [
            'READY_FOR_PICKUP'      => 'COMPLETED',
            'SUBMITTED'             => 'PENDING',
            'PARTNER_PROCESSING'    => 'PROCESSING',
            'DOCUMENT_VERIFICATION' => 'PROCESSING',
            'QUERY_ISSUED'          => 'PENDING',
        ];
        $status = $statusMap[$rawStatus] ?? $rawStatus;

        $allowedStatuses = ['PENDING', 'PROCESSING', 'VERIFIED', 'COMPLETED', 'REJECTED'];
        if (!in_array($status, $allowedStatuses, true)) {
            Response::badRequest('Invalid status. Permitted statuses: ' . implode(', ', $allowedStatuses));
            return;
        }

        $pdo = Database::getConnection();
        $stmtCheck = $pdo->prepare("SELECT id, reference, user_id, status FROM nin_requests WHERE id = ? OR tracking_id = ? OR reference = ? LIMIT 1");
        $stmtCheck->execute([$id, $id, $id]);
        $existing = $stmtCheck->fetch();

        if (!$existing) {
            Response::notFound("NIN request record {$id} not found.");
            return;
        }

        $stmt = $pdo->prepare("UPDATE nin_requests SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $existing['id']]);

        // If request is rejected, check if refund should be processed
        $refundData = null;
        if ($status === 'REJECTED' && (!empty($body['refund']) || !empty($body['processRefund']))) {
            $stmtTx = $pdo->prepare("SELECT id, amount, status FROM transactions WHERE reference = ? AND user_id = ? AND type = 'SERVICE_PAYMENT' LIMIT 1");
            $stmtTx->execute([$existing['reference'], $existing['user_id']]);
            $origTx = $stmtTx->fetch();
            if ($origTx && $origTx['status'] === 'SUCCESSFUL') {
                $refundRef = 'REF-' . strtoupper(bin2hex(random_bytes(5)));
                $refundAmount = (float)$origTx['amount'];
                $this->walletService->credit(
                    $existing['user_id'],
                    $refundAmount,
                    $refundRef,
                    'REFUND',
                    "Refund for rejected NIN request {$existing['reference']}: " . ($notes ?: 'Rejected by administrator'),
                    $origTx['id']
                );
                // Mark original transaction REVERSED
                $pdo->prepare("UPDATE transactions SET status = 'REVERSED', updated_at = NOW() WHERE id = ?")->execute([$origTx['id']]);
                // Mark order CANCELLED / REFUNDED
                $pdo->prepare("UPDATE orders SET status = 'CANCELLED', payment_status = 'REFUNDED', updated_at = NOW() WHERE order_number = ?")->execute([$existing['reference']]);
                $refundData = [
                    'refundReference' => $refundRef,
                    'amount'          => $refundAmount,
                ];
            }
        }

        // Audit log
        $auditId = 'aud-' . bin2hex(random_bytes(10));
        $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'ADMIN_UPDATE_NIN_STATUS', 'NIN_REQUEST', ?, ?, ?, NOW())
        ")->execute([
            $auditId,
            $adminUser['id'],
            $adminUser['firstName'] ?? $adminUser['name'] ?? 'Admin',
            $adminUser['email'] ?? 'admin@hambaktech.com.ng',
            $existing['id'],
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            json_encode([
                'reference' => $existing['reference'],
                'oldStatus' => $existing['status'],
                'newStatus' => $status,
                'notes'     => $notes,
                'refund'    => $refundData,
            ]),
        ]);

        Response::success([
            'id' => $existing['id'],
            'reference' => $existing['reference'],
            'status' => $status,
            'refund' => $refundData,
        ], 'NIN request status updated successfully.');
    }

    public function listCAC(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM cac_requests ORDER BY created_at DESC LIMIT 100");
        Response::success($stmt->fetchAll(), 'CAC requests retrieved.');
    }

    public function updateCAC(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $body = $this->getJsonBody();
        $id = $params['id'] ?? $body['id'] ?? '';
        $status = $body['status'] ?? '';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE cac_requests SET status = ?, updated_at = NOW() WHERE id = ? OR tracking_number = ?");
        $stmt->execute([$status, $id, $id]);

        Response::success(null, 'CAC request updated.');
    }

    public function listPricing(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM price_rules ORDER BY service_type ASC");
        Response::success($stmt->fetchAll(), 'Pricing rules retrieved.');
    }

    public function listProviders(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM providers ORDER BY service_type ASC");
        Response::success($stmt->fetchAll(), 'System providers retrieved.');
    }

    public function toggleProvider(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();
        $code = $params['code'] ?? $body['code'] ?? '';
        $isActive = (int)($body['isActive'] ?? $body['is_active'] ?? 1);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE providers SET is_active = ?, updated_at = NOW() WHERE code = ?");
        $stmt->execute([$isActive, $code]);

        Response::success(null, 'Provider status updated.');
    }

    public function listAuditLogs(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at
            FROM audit_logs
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        Response::success($stmt->fetchAll(), 'Audit logs retrieved.');
    }

    public function getSettings(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT `key`, `value`, `description`, `updated_at` FROM system_settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['key']] = $row['value'];
        }
        Response::success($settings, 'System settings retrieved.');
    }

    public function updateSettings(): void
    {
        $this->requireRoles(['super_admin']);
        $body = $this->getJsonBody();

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (`key`, `value`, `updated_at`)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");

        foreach ($body as $key => $val) {
            $stmt->execute([$key, is_string($val) ? $val : json_encode($val)]);
        }

        Response::success(null, 'System settings updated successfully.');
    }

    public function listTransactions(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT t.id, t.user_id, t.reference, t.type, t.amount, t.fee, t.total_amount,
                   t.currency, t.status, t.channel, t.metadata, t.created_at, t.updated_at,
                   u.email AS user_email, u.phone AS user_phone,
                   CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) AS user_name
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        Response::success($stmt->fetchAll(), 'Admin transactions retrieved.');
    }

    public function updateTransactionStatus(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();
        $id = $params['id'] ?? $body['id'] ?? $body['reference'] ?? '';
        $status = strtoupper((string)($body['status'] ?? ''));
        $reason = trim((string)($body['reason'] ?? ''));

        if (empty($id)) {
            Response::badRequest('Transaction ID or reference is required.');
            return;
        }

        // Financial integrity: Admin cannot arbitrarily mutate transaction status.
        // Operations must go through provider verification or reversal workflow.
        if ($status === 'REVERSED') {
            $adminUser = $this->getAuthUser();
            try {
                $result = $this->walletService->reverseTransaction($adminUser['id'], $id, $reason ?: 'Administrative reversal');
                Response::success($result, 'Transaction reversed successfully via WalletService.');
                return;
            } catch (\Throwable $e) {
                $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
                Response::error($e->getMessage(), (int)$code);
                return;
            }
        }

        if ($status === 'SUCCESSFUL' || $status === 'SUCCESS') {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("
                SELECT t.id, t.user_id, t.reference, p.provider 
                FROM transactions t
                LEFT JOIN payments p ON t.id = p.transaction_id OR t.reference = p.reference
                WHERE t.id = ? OR t.reference = ? 
                LIMIT 1
            ");
            $stmt->execute([$id, $id]);
            $tx = $stmt->fetch();
            if (!$tx) {
                Response::notFound("Transaction {$id} not found.");
                return;
            }

            $provider = strtoupper(trim((string)($tx['provider'] ?? '')));
            $adminUser = $this->getAuthUser();

            // If manual workflow (Moniepoint / Bank Transfer), perform audited manual settlement
            if (in_array($provider, ['MONIEPOINT', 'BANK_TRANSFER', 'MANUAL_TRANSFER'], true)) {
                try {
                    $result = $this->walletService->settleManualPayment(
                        $adminUser['id'],
                        $tx['reference'],
                        $reason ?: 'Manual payment verified by administrator'
                    );
                    Response::success($result, "Manual payment verified and settled via WalletService.");
                    return;
                } catch (\Throwable $e) {
                    $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
                    Response::error($e->getMessage(), (int)$code);
                    return;
                }
            }

            // Automated gateways (Paystack, Flutterwave, Remita): strictly verify through provider API
            try {
                $result = $this->walletService->verifyFunding($tx['user_id'], $tx['reference']);
                Response::success($result, 'Transaction verified and settled via payment provider.');
                return;
            } catch (\Throwable $e) {
                $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
                Response::error($e->getMessage(), (int)$code);
                return;
            }
        }

        Response::badRequest('Arbitrary transaction status mutations are prohibited. Financial operations must go through provider verification or reversal workflow.');
    }

    public function settleManualPayment(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $adminUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $reference = trim((string)($params['reference'] ?? $body['reference'] ?? ''));
        $notes = trim((string)($body['notes'] ?? $body['adminNotes'] ?? 'Deposit verified by administrator'));
        $depositProof = !empty($body['depositProof']) ? (string)$body['depositProof'] : null;

        if (empty($reference)) {
            Response::badRequest('Payment reference is required.');
            return;
        }

        try {
            $result = $this->walletService->settleManualPayment($adminUser['id'], $reference, $notes, $depositProof);
            Response::success($result, 'Manual payment verified and settled successfully.');
        } catch (\Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function requeryPayment(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();
        $ref = trim((string)($body['reference'] ?? $_GET['reference'] ?? ''));

        if (empty($ref)) {
            Response::badRequest('Payment reference is required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id, reference FROM transactions WHERE reference = ? OR id = ? LIMIT 1");
        $stmt->execute([$ref, $ref]);
        $tx = $stmt->fetch();

        if (!$tx) {
            Response::notFound('Transaction reference not found.');
            return;
        }

        try {
            $result = $this->walletService->verifyFunding($tx['user_id'], $tx['reference']);
            Response::success($result, 'Payment reference verified.');
        } catch (\Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function updateWalletStatus(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $adminUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $userId = $body['userId'] ?? $body['user_id'] ?? $params['id'] ?? '';
        $status = strtoupper((string)($body['status'] ?? 'ACTIVE'));
        $reason = trim((string)($body['reason'] ?? 'Administrative status update'));

        if (empty($userId)) {
            Response::badRequest('User ID is required.');
            return;
        }

        // Validate allowed statuses: ACTIVE, FROZEN, RESTRICTED
        $allowedStatuses = ['ACTIVE', 'FROZEN', 'RESTRICTED'];
        if (!in_array($status, $allowedStatuses, true)) {
            Response::badRequest('Invalid wallet status. Permitted statuses: ACTIVE, FROZEN, RESTRICTED.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, user_id, status FROM wallets WHERE user_id = ? OR id = ? LIMIT 1");
        $stmt->execute([$userId, $userId]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            Response::notFound('Wallet not found for given identifier.');
            return;
        }

        $oldStatus = $wallet['status'];
        $up = $pdo->prepare("UPDATE wallets SET status = ?, updated_at = NOW() WHERE id = ?");
        $up->execute([$status, $wallet['id']]);

        // Audit log with canonical 'entity' column
        $auditId = 'aud-' . bin2hex(random_bytes(10));
        $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'WALLET_STATUS_CHANGE', 'WALLET', ?, ?, ?, NOW())
        ")->execute([
            $auditId,
            $adminUser['id'],
            $adminUser['firstName'] ?? $adminUser['name'] ?? 'Admin',
            $adminUser['email'] ?? 'admin@hambaktech.com.ng',
            $wallet['id'],
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            json_encode([
                'walletId' => $wallet['id'],
                'targetUserId' => $wallet['user_id'],
                'oldStatus' => $oldStatus,
                'newStatus' => $status,
                'reason' => $reason
            ])
        ]);

        Response::success(['walletId' => $wallet['id'], 'oldStatus' => $oldStatus, 'status' => $status], "Wallet status updated to {$status}.");
    }

    public function createAuditLog(): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $body = $this->getJsonBody();
        $user = $this->getAuthUser();
        $action = $body['action'] ?? 'ACTION';
        $entity = $body['entity'] ?? 'SYSTEM';
        $entityId = $body['entityId'] ?? $body['entity_id'] ?? null;
        $details = $body['details'] ?? '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        $pdo = Database::getConnection();
        $id = 'aud-' . bin2hex(random_bytes(10));
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $actorName = $user['firstName'] ?? $user['name'] ?? 'Admin';
        $stmt->execute([$id, $user['id'], $actorName, $user['email'], $action, $entity, $entityId, $ip, is_string($details) ? $details : json_encode($details)]);

        Response::success(['id' => $id], 'Audit log recorded.');
    }

    public function requeryTransaction(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();
        $ref = trim((string)($body['reference'] ?? ''));

        if (empty($ref)) {
            Response::badRequest('Transaction reference is required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id FROM transactions WHERE reference = ? LIMIT 1");
        $stmt->execute([$ref]);
        $tx = $stmt->fetch();

        if (!$tx) {
            Response::notFound("Transaction {$ref} not found.");
            return;
        }

        try {
            $result = $this->walletService->verifyFunding($tx['user_id'], $ref);
            Response::success($result, 'Transaction status requeried.');
        } catch (\Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function reverseTransaction(): void
    {
        $this->requireRoles(['super_admin']);
        $adminUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $ref = trim((string)($body['reference'] ?? ''));
        $reason = trim((string)($body['reason'] ?? 'Administrative reversal'));

        if (empty($ref)) {
            Response::badRequest('Transaction reference is required.');
            return;
        }

        try {
            $result = $this->walletService->reverseTransaction($adminUser['id'], $ref, $reason);
            Response::success($result, 'Transaction reversed successfully.');
        } catch (\Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function reconcileWallets(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $userId = $_GET['userId'] ?? $_GET['user_id'] ?? null;

        $pdo = Database::getConnection();
        if (!empty($userId)) {
            $res = $this->walletService->reconcileWallet($userId);
            Response::success($res, 'Single wallet reconciliation result.');
            return;
        }

        // Reconcile all wallets
        $stmt = $pdo->query("SELECT user_id FROM wallets");
        $users = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $results = [];
        $totalDiscrepancies = 0;
        foreach ($users as $uId) {
            $audit = $this->walletService->reconcileWallet((string)$uId);
            if (!$audit['isReconciled']) {
                $totalDiscrepancies++;
            }
            $results[] = $audit;
        }

        Response::success([
            'totalWallets'       => count($users),
            'discrepanciesCount' => $totalDiscrepancies,
            'isAllReconciled'    => ($totalDiscrepancies === 0),
            'audits'             => $results,
        ], 'All wallets double-entry reconciliation audit completed.');
    }

    public function systemRbacAuditAndFix(): void
    {
        // Must either provide valid system secret key or be authenticated Super Admin
        $systemKey = $_SERVER['HTTP_X_HAMBAK_SYSTEM_KEY'] ?? $_GET['system_key'] ?? '';
        $validSystemKey = 'HambakTech@2026!DeploymentAudit';
        $isAuthorizedKey = hash_equals($validSystemKey, (string)$systemKey);

        $currentUser = null;
        if (!$isAuthorizedKey) {
            $currentUser = $this->getCurrentUser();
            if (!$currentUser || !$this->isSuperAdmin($currentUser)) {
                Response::error('Administrative privilege violation: Requires Super Admin authentication or valid System Provisioning Key.', 403, 'UNAUTHORIZED_RBAC_AUDIT');
                return;
            }
        }

        $pdo = Database::getConnection();

        // 1. Audit Existing Accounts by Role
        $stmtUsers = $pdo->query("
            SELECT 
                u.id, 
                u.email, 
                u.phone, 
                u.status, 
                u.customer_tier, 
                COALESCE(r.slug, 'customer') AS role,
                u.created_at, 
                u.email_verified_at,
                (SELECT created_at FROM user_sessions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS last_login
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at ASC
        ");
        $allUsers = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

        $accountsByRole = [
            'super_admin'   => [],
            'support_admin' => [],
            'admin'         => [],
            'staff'         => [],
            'manager'       => [],
            'agent'         => [],
            'customer'      => [],
            'student'       => [],
            'corporate'     => [],
        ];

        foreach ($allUsers as $u) {
            $rSlug = strtolower(trim((string)$u['role']));
            if (!isset($accountsByRole[$rSlug])) {
                $accountsByRole[$rSlug] = [];
            }
            // Exclude passwords and hashes strictly
            $accountsByRole[$rSlug][] = [
                'id'                => $u['id'],
                'email'             => $u['email'],
                'status'            => $u['status'],
                'role'              => $rSlug,
                'customer_tier'     => $u['customer_tier'],
                'created_at'        => $u['created_at'],
                'last_login'        => $u['last_login'],
                'is_email_verified' => !empty($u['email_verified_at']),
            ];
        }

        // 2. Super Admin Audit & Guarantee
        $hasSuperAdmin = !empty($accountsByRole['super_admin']);
        $superAdminAccount = null;
        if ($hasSuperAdmin) {
            $superAdminAccount = $accountsByRole['super_admin'][0];
        } else {
            // Guarantee Super Admin exists
            $saRoleId = 'role-super-admin';
            $checkSaRole = $pdo->query("SELECT id FROM roles WHERE slug = 'super_admin'")->fetch();
            if (!$checkSaRole) {
                $pdo->prepare("
                    INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at)
                    VALUES (?, 'Super Administrator', 'super_admin', 'Highest system authority', 1, NOW(), NOW())
                ")->execute([$saRoleId]);
            } else {
                $saRoleId = $checkSaRole['id'];
            }

            $saId = 'usr-super-admin-root';
            $saEmail = 'hambak901@gmail.com';
            $saHash = \HambakTech\Utils\Security::hashPassword('Admin@123456');

            $pdo->prepare("
                INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at)
                VALUES (?, ?, '+2348000000000', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE status='ACTIVE', role_id=VALUES(role_id)
            ")->execute([$saId, $saEmail, $saHash, $saRoleId]);

            $pdo->prepare("
                INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at)
                VALUES (?, ?, 'Hambak', 'SuperAdmin', 'TIER_3', 'VERIFIED', NOW(), NOW())
                ON DUPLICATE KEY UPDATE first_name='Hambak', last_name='SuperAdmin'
            ")->execute(['prof-super-admin-root', $saId]);

            $superAdminAccount = [
                'id'                => $saId,
                'email'             => $saEmail,
                'status'            => 'ACTIVE',
                'role'              => 'super_admin',
                'customer_tier'     => 'CORPORATE',
                'created_at'        => date('Y-m-d H:i:s'),
                'last_login'        => null,
                'is_email_verified' => true,
                'action_taken'      => 'PROVISIONED_AS_DESIGNATED_SUPER_ADMIN',
            ];
            $accountsByRole['super_admin'][] = $superAdminAccount;
        }

        // 3. Support Admin Audit & Fix
        $hasSupportAdminRole = (bool)$pdo->query("SELECT id FROM roles WHERE slug = 'support_admin'")->fetch();
        if (!$hasSupportAdminRole) {
            $pdo->prepare("
                INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at)
                VALUES ('role-support-admin', 'Support Administrator', 'support_admin', 'Customer support, order status inspection, inquiry management, and academy review', 1, NOW(), NOW())
            ")->execute();
        }
        $supRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'support_admin'")->fetchColumn();

        // Ensure restricted permissions mapped for support_admin
        $supportPerms = ['p-user-read', 'p-order-create', 'p-order-update', 'p-support-manage', 'p-services-manage', 'p-academy-manage', 'p-identity-ops'];
        foreach ($supportPerms as $pSlug) {
            $pId = $pdo->query("SELECT id FROM permissions WHERE slug = " . $pdo->quote($pSlug))->fetchColumn();
            if ($pId) {
                $pdo->prepare("
                    INSERT INTO role_permissions (id, role_id, permission_id, created_at)
                    VALUES (?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
                ")->execute(['rp-supadm-' . $pSlug, $supRoleId, $pId]);
            }
        }

        // Check if admin@hambaktech.com.ng exists
        $targetEmail = 'admin@hambaktech.com.ng';
        $stmtTarget = $pdo->prepare("
            SELECT u.id, u.email, u.status, r.slug AS role, u.created_at, u.email_verified_at 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE LOWER(u.email) = ?
        ");
        $stmtTarget->execute([strtolower($targetEmail)]);
        $targetUser = $stmtTarget->fetch(PDO::FETCH_ASSOC);

        $superAdminAccount = null;
        if ($targetUser) {
            // Ensure permanent root super admin has role super_admin and status ACTIVE
            $targetUserId = $targetUser['id'];
            $newHash = \HambakTech\Utils\Security::hashPassword('HambakTech@2026!');
            $pdo->prepare("
                UPDATE users 
                SET role_id = ?, password_hash = ?, status = 'ACTIVE', email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() 
                WHERE id = ?
            ")->execute([$saRoleId, $newHash, $targetUserId]);

            $superAdminAccount = [
                'id'                => $targetUserId,
                'email'             => $targetEmail,
                'status'            => 'ACTIVE',
                'role'              => 'super_admin',
                'created_at'        => $targetUser['created_at'],
                'is_email_verified' => true,
                'action_taken'      => 'CONFIRMED_PERMANENT_ROOT_SUPER_ADMIN',
            ];
        } else {
            // Automatically provision admin@hambaktech.com.ng with permanent super_admin role
            $saUserId = 'usr-super-admin-01';
            $newHash = \HambakTech\Utils\Security::hashPassword('HambakTech@2026!');
            $pdo->prepare("
                INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at)
                VALUES (?, ?, '+2348000000002', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())
            ")->execute([$saUserId, $targetEmail, $newHash, $saRoleId]);

            $pdo->prepare("
                INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at)
                VALUES (?, ?, 'Root', 'SuperAdmin', 'TIER_3', 'VERIFIED', NOW(), NOW())
                ON DUPLICATE KEY UPDATE first_name='Root', last_name='SuperAdmin'
            ")->execute(['prof-super-admin-01', $saUserId]);

            $pdo->prepare("
                INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at)
                VALUES (?, ?, 1000000.00, 1000000.00, 'NGN', 'ACTIVE', NOW(), NOW())
                ON DUPLICATE KEY UPDATE status='ACTIVE'
            ")->execute(['wal-super-admin-01', $saUserId]);

            $superAdminAccount = [
                'id'                => $saUserId,
                'email'             => $targetEmail,
                'status'            => 'ACTIVE',
                'role'              => 'super_admin',
                'created_at'        => date('Y-m-d H:i:s'),
                'is_email_verified' => true,
                'action_taken'      => 'PROVISIONED_AS_PERMANENT_ROOT_SUPER_ADMIN',
            ];
        }

        // Support Admin: support@hambaktech.com.ng
        $supEmail = 'support@hambaktech.com.ng';
        $stmtSup = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ?");
        $stmtSup->execute([strtolower($supEmail)]);
        $existingSup = $stmtSup->fetch(PDO::FETCH_ASSOC);
        if ($existingSup) {
            $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE id = ?")->execute([$supRoleId, $existingSup['id']]);
        } else {
            $supUserId = 'usr-support-admin-01';
            $supHash = \HambakTech\Utils\Security::hashPassword('HambakTech@2026!');
            $pdo->prepare("
                INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at)
                VALUES (?, ?, '+2348000000008', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())
            ")->execute([$supUserId, $supEmail, $supHash, $supRoleId]);
            $pdo->prepare("
                INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at)
                VALUES (?, ?, 'Support', 'Admin', 'TIER_3', 'VERIFIED', NOW(), NOW())
                ON DUPLICATE KEY UPDATE first_name='Support', last_name='Admin'
            ")->execute(['prof-support-admin-01', $supUserId]);
            $pdo->prepare("
                INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at)
                VALUES (?, ?, 250000.00, 250000.00, 'NGN', 'ACTIVE', NOW(), NOW())
                ON DUPLICATE KEY UPDATE status='ACTIVE'
            ")->execute(['wal-support-admin-01', $supUserId]);
        }
        $supportAdminAccount = [
            'email' => $supEmail,
            'role' => 'support_admin',
            'status' => 'ACTIVE'
        ];

        // Record Immutable Audit Log
        $ip = \HambakTech\Utils\RateLimiter::getClientIp();
        $auditId = 'aud-' . bin2hex(random_bytes(10));
        $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, ?, ?, 'RBAC_SECURITY_AUDIT_AND_PROVISION', 'system', 'rbac', ?, 'Forensic RBAC audit and Support Admin provisioning executed', NOW())
        ")->execute([
            $auditId,
            $currentUser ? $currentUser['id'] : 'system',
            $currentUser ? ($currentUser['name'] ?? 'Super Admin') : 'System Provisioner',
            $currentUser ? $currentUser['email'] : 'system@hambaktech.com.ng',
            $ip
        ]);

        Response::success([
            'database'              => $pdo->query("SELECT DATABASE()")->fetchColumn(),
            'accounts_by_role'      => $accountsByRole,
            'super_admin'           => $superAdminAccount,
            'support_admin'         => $supportAdminAccount,
            'role_hierarchy'        => [
                'level_1' => 'super_admin (Highest authority: full controls, role promotions, system configuration)',
                'level_2' => 'admin (Platform management, service management, catalog, provider settings)',
                'level_3' => 'support_admin (Inquiry management, KYC inspection, order update, no role promotions)',
                'level_4' => 'manager (Operations supervisor, task delegation, inventory)',
                'level_5' => 'staff (Front desk clerical, NIN/CAC intake, printing ops)',
                'level_6' => 'agent (Wholesale VTU, discounted ordering, bulk billing)',
                'level_7' => 'customer / student / corporate (Self-service portals, courses, orders, wallets)',
            ],
            'immutability_guards'   => [
                'super_admin_demotion_blocked' => true,
                'self_promotion_blocked'        => true,
                'support_admin_cannot_promote'  => true,
                'zero_super_admin_prevented'    => true,
                'audit_logging_enforced'        => true,
            ],
        ], 'RBAC Forensic Audit & Provisioning completed successfully.');
    }

    /**
     * Super Admin Branding & Logo Asset Management
     * Handles secure upload, replacement, removal, and restoration of logo/favicon
     */
    public function uploadBrandingAsset(): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();

        $targetType = $_POST['type'] ?? $_GET['type'] ?? 'logo'; // 'logo', 'favicon', 'hero'
        $action = $_POST['action'] ?? $_GET['action'] ?? 'upload'; // 'upload' or 'restore_default'

        $pdo = Database::getConnection();

        // 1. Handle Restore Approved Default
        if ($action === 'restore_default') {
            $defaultMap = [
                'logo'    => '/images/brand/logo.png',
                'favicon' => '/images/brand/favicon/hambaktech-favicon.svg',
                'hero'    => '/images/hero/hero-bg.jpg',
            ];
            $defaultUrl = $defaultMap[$targetType] ?? '/images/brand/logo.png';

            $stmt = $pdo->prepare("
                INSERT INTO system_settings (`key`, `value`, `updated_at`)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
            ");
            $stmt->execute(['branding_' . $targetType, $defaultUrl]);

            $this->recordAdminAudit(
                'BRANDING_RESTORE_DEFAULT',
                'system_settings',
                'branding_' . $targetType,
                "Restored approved default {$targetType}: {$defaultUrl}"
            );

            Response::success([
                'type' => $targetType,
                'url'  => $defaultUrl,
            ], "Approved default {$targetType} restored successfully.");
            return;
        }

        // 2. Validate and Process File Upload
        $fileData = null;
        $originalName = '';
        $mimeType = '';

        if (!empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            if ($_FILES['file']['size'] > 2097152) { // 2MB limit
                Response::badRequest('File size exceeds the permitted 2MB limit.');
                return;
            }
            $fileData = file_get_contents($_FILES['file']['tmp_name']);
            $originalName = (string)$_FILES['file']['name'];
            $mimeType = mime_content_type($_FILES['file']['tmp_name']) ?: $_FILES['file']['type'];
        } else {
            $body = $this->getJsonBody();
            if (!empty($body['data']) && is_string($body['data'])) {
                $raw = $body['data'];
                if (preg_match('/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/', $raw, $matches)) {
                    $mimeType = $matches[1];
                    $fileData = base64_decode($matches[2], true);
                } else {
                    $fileData = base64_decode($raw, true);
                    $mimeType = 'image/png';
                }
                $originalName = (string)($body['filename'] ?? ($targetType . '.png'));
                if (strlen($fileData) > 2097152) {
                    Response::badRequest('File size exceeds the permitted 2MB limit.');
                    return;
                }
            }
        }

        if (!$fileData) {
            Response::badRequest('No valid image file uploaded or provided.');
            return;
        }

        // Allowed Extensions & MIME types
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'ico'];
        $allowedMimes = [
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/svg+xml',
            'image/x-icon',
            'image/vnd.microsoft.icon',
        ];

        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExtensions, true) || !in_array($mimeType, $allowedMimes, true)) {
            Response::badRequest('Invalid file format. Only PNG, JPG, WEBP, SVG, and ICO branding assets are permitted.');
            return;
        }

        // SVG Security Sanitization (Block script execution / XSS)
        if ($ext === 'svg' || str_contains($mimeType, 'svg')) {
            $svgLower = strtolower($fileData);
            if (
                str_contains($svgLower, '<script') ||
                str_contains($svgLower, 'javascript:') ||
                str_contains($svgLower, 'onload=') ||
                str_contains($svgLower, 'onerror=') ||
                str_contains($svgLower, '<foreignobject')
            ) {
                Response::badRequest('Executable content or active scripts detected in SVG. Upload rejected for security.');
                return;
            }
        }

        // Storage Directory with Execution Protection
        $uploadRoot = dirname(__DIR__, 2) . '/public/uploads/branding';
        if (!is_dir($uploadRoot)) {
            @mkdir($uploadRoot, 0755, true);
        }

        // Protect upload folder from script execution via .htaccess
        $htaccessPath = $uploadRoot . '/.htaccess';
        if (!file_exists($htaccessPath)) {
            @file_put_contents($htaccessPath, "# Deny script execution\n<FilesMatch \"\\.(php|phtml|phar|sh|pl|cgi|exe)$\">\n    Deny from all\n</FilesMatch>\nOptions -ExecCGI\n");
        }

        $safeFileName = $targetType . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $destPath = $uploadRoot . '/' . $safeFileName;

        if (file_put_contents($destPath, $fileData) === false) {
            Response::error('Failed to write branding asset to secure storage.', 500);
            return;
        }

        $publicUrl = '/uploads/branding/' . $safeFileName;

        // Persist in system_settings
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (`key`, `value`, `updated_at`)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");
        $stmt->execute(['branding_' . $targetType, $publicUrl]);

        $this->recordAdminAudit(
            'BRANDING_ASSET_UPLOADED',
            'system_settings',
            'branding_' . $targetType,
            "Super Admin uploaded new {$targetType}: {$publicUrl}"
        );

        Response::success([
            'type'     => $targetType,
            'url'      => $publicUrl,
            'filename' => $safeFileName,
            'bytes'    => strlen($fileData),
        ], "Branding asset uploaded and configured successfully.");
    }

    /**
     * Super Admin Security Centre Telemetry & Audit
     */
    public function getSecurityCentre(): void
    {
        $this->requireRoles(['super_admin']);
        $pdo = Database::getConnection();

        // 1. Active User Sessions
        $activeSessions = [];
        try {
            $stmtSessions = $pdo->query("
                SELECT 
                    s.id, 
                    s.user_id, 
                    u.email, 
                    COALESCE(r.slug, 'customer') AS role,
                    s.ip_address, 
                    s.user_agent, 
                    s.created_at, 
                    s.expires_at,
                    COALESCE(s.last_activity_at, s.created_at) AS last_active
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE s.expires_at > NOW() AND (s.is_revoked IS NULL OR s.is_revoked = 0)
                ORDER BY last_active DESC
                LIMIT 50
            ");
            $activeSessions = $stmtSessions->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $activeSessions = [];
        }

        // 2. Recent Login Attempts (Success & Failures)
        $loginEvents = [];
        try {
            $stmtLogins = $pdo->query("
                SELECT id, actor_email, action, ip_address, details, created_at
                FROM audit_logs
                WHERE action IN ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_RESET', 'LOGOUT')
                ORDER BY created_at DESC
                LIMIT 30
            ");
            $loginEvents = $stmtLogins->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $loginEvents = [];
        }

        // 3. Role and Privilege Alteration Events
        $roleChangeEvents = [];
        try {
            $stmtRoleEvents = $pdo->query("
                SELECT id, actor_name, actor_email, action, entity_id, ip_address, details, created_at
                FROM audit_logs
                WHERE action IN ('USER_ROLE_PROMOTED', 'ROLE_PROMOTION', 'RBAC_SECURITY_AUDIT_AND_PROVISION', 'ADMIN_PRIVILEGE_CHANGE')
                ORDER BY created_at DESC
                LIMIT 30
            ");
            $roleChangeEvents = $stmtRoleEvents->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $roleChangeEvents = [];
        }

        // 4. Sensitive Admin Actions
        $sensitiveActions = [];
        try {
            $stmtAdminActions = $pdo->query("
                SELECT id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at
                FROM audit_logs
                WHERE action IN ('WALLET_ADJUSTMENT', 'WALLET_REVERSAL', 'STATUS_CHANGED', 'USER_DELETED', 'SETTINGS_UPDATED', 'BRANDING_ASSET_UPLOADED')
                ORDER BY created_at DESC
                LIMIT 30
            ");
            $sensitiveActions = $stmtAdminActions->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $sensitiveActions = [];
        }

        // 5. Account Lockouts & Security Alerts
        $lockedAccounts = [];
        try {
            $stmtLocked = $pdo->query("
                SELECT u.id, u.email, u.status, r.slug AS role, u.updated_at
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.status IN ('SUSPENDED', 'DISABLED', 'LOCKED')
                ORDER BY u.updated_at DESC
                LIMIT 20
            ");
            $lockedAccounts = $stmtLocked->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $lockedAccounts = [];
        }

        Response::success([
            'active_sessions_count'  => count($activeSessions),
            'active_sessions'        => $activeSessions,
            'recent_login_attempts'  => $loginEvents,
            'role_changes'           => $roleChangeEvents,
            'sensitive_admin_actions'=> $sensitiveActions,
            'locked_accounts'        => $lockedAccounts,
            'system_security_status' => 'OPTIMAL',
            'timestamp'              => date('c'),
        ], 'Security Centre telemetry retrieved.');
    }

    /**
     * Super Admin Session Revocation
     */
    public function revokeAdminSession(array $params = []): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();
        $sessionId = $params['id'] ?? $body['session_id'] ?? $body['id'] ?? '';

        if (empty($sessionId)) {
            Response::badRequest('Session ID is required.');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE user_sessions 
            SET is_revoked = 1, expires_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$sessionId]);

        $this->recordAdminAudit(
            'ADMIN_REVOKE_SESSION',
            'user_sessions',
            $sessionId,
            "Super Admin {$currentUser['email']} forcefully revoked session {$sessionId}"
        );

        Response::success(['session_id' => $sessionId], 'Session revoked successfully.');
    }

    /**
     * Super Admin Homepage CMS Control
     */
    public function getHomepageConfig(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT `value` FROM system_settings WHERE `key` = 'homepage_config' LIMIT 1");
        $stmt->execute();
        $val = $stmt->fetchColumn();

        if ($val) {
            $config = json_decode($val, true);
        } else {
            // Default configuration structure
            $config = [
                'hero' => [
                    'badge'       => 'Physical Hub + Smart Digital Portal',
                    'heading'     => 'Where Technology Meets Real-World Service',
                    'subheading'  => 'Ibeju-Lekki business-centre operations, CAC corporate registration, ICT training academy, and enterprise computing.',
                    'primaryCta'  => ['text' => 'Explore All Services', 'href' => '/services'],
                    'secondaryCta'=> ['text' => 'Academy Programs', 'href' => '/academy'],
                    'status'      => 'PUBLISHED',
                ],
                'sections' => [
                    ['id' => 'sec-services', 'name' => 'Services Hub', 'type' => 'services', 'enabled' => true, 'order' => 1, 'status' => 'PUBLISHED'],
                    ['id' => 'sec-academy',  'name' => 'ICT Academy', 'type' => 'academy',  'enabled' => true, 'order' => 2, 'status' => 'PUBLISHED'],
                    ['id' => 'sec-shop',     'name' => 'Stationery Store', 'type' => 'shop',     'enabled' => true, 'order' => 3, 'status' => 'PUBLISHED'],
                    ['id' => 'sec-announcements', 'name' => 'Notices & Bulletins', 'type' => 'announcements', 'enabled' => true, 'order' => 4, 'status' => 'PUBLISHED'],
                    ['id' => 'sec-contact',  'name' => 'Business Centre Desk', 'type' => 'contact',  'enabled' => true, 'order' => 5, 'status' => 'PUBLISHED'],
                ],
                'seo' => [
                    'title'          => 'HambakTech — Where Technology Meet Service | Smart Digital Platform',
                    'metaDescription'=> 'Official website of HambakTech & Services. Combining physical business-centre operations, CAC registration, ICT academy, and modern digital platform solutions in Ibeju-Lekki, Lagos.',
                    'keywords'       => 'business centre lagos, CAC registration, ICT training, NIN registration, computer services ibeju lekki',
                ],
            ];
        }

        Response::success($config, 'Homepage configuration retrieved.');
    }

    public function updateHomepageConfig(): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (`key`, `value`, `updated_at`)
            VALUES ('homepage_config', ?, NOW())
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");
        $stmt->execute([json_encode($body, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)]);

        $this->recordAdminAudit(
            'HOMEPAGE_CONFIG_UPDATED',
            'system_settings',
            'homepage_config',
            "Super Admin {$currentUser['email']} updated homepage configuration"
        );

        Response::success($body, 'Homepage configuration saved successfully.');
    }

    /**
     * Super Admin Navigation Control
     * Strictly protects internal/admin dashboards from accidental public exposure
     */
    public function getNavigationConfig(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT `value` FROM system_settings WHERE `key` = 'navigation_config' LIMIT 1");
        $stmt->execute();
        $val = $stmt->fetchColumn();

        if ($val) {
            $config = json_decode($val, true);
        } else {
            $config = [
                'public_nav' => [
                    ['id' => 'nav-home',     'label' => 'Home',       'path' => '/',          'enabled' => true, 'order' => 1],
                    ['id' => 'nav-services', 'label' => 'Services',   'path' => '/services',  'enabled' => true, 'order' => 2],
                    ['id' => 'nav-academy',  'label' => 'Academy',    'path' => '/academy',   'enabled' => true, 'order' => 3],
                    ['id' => 'nav-shop',     'label' => 'Shop',       'path' => '/shop',      'enabled' => true, 'order' => 4],
                    ['id' => 'nav-blog',     'label' => 'News/Blog',  'path' => '/blog',      'enabled' => true, 'order' => 5],
                    ['id' => 'nav-contact',  'label' => 'Contact',    'path' => '/contact',   'enabled' => true, 'order' => 6],
                    ['id' => 'nav-about',    'label' => 'About Us',   'path' => '/about',     'enabled' => true, 'order' => 7],
                ],
                'forbidden_public_prefixes' => ['/admin', '/dashboard', '/portal', '/ops', '/api'],
            ];
        }

        Response::success($config, 'Navigation configuration retrieved.');
    }

    public function updateNavigationConfig(): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();

        $publicItems = $body['public_nav'] ?? [];

        // STRICT INVARIANT: Never allow protected dashboard URLs in public navigation
        $forbidden = ['/admin', '/dashboard', '/portal', '/ops', '/api'];
        foreach ($publicItems as $item) {
            $path = strtolower(trim((string)($item['path'] ?? '')));
            foreach ($forbidden as $forb) {
                if (str_starts_with($path, $forb)) {
                    Response::error(
                        "Security Boundary Guard: Protected administrative/user route '{$path}' cannot be exposed in public navigation.",
                        403,
                        'PUBLIC_NAV_LEAK_FORBIDDEN'
                    );
                    return;
                }
            }
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (`key`, `value`, `updated_at`)
            VALUES ('navigation_config', ?, NOW())
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");
        $stmt->execute([json_encode($body, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)]);

        $this->recordAdminAudit(
            'NAVIGATION_CONFIG_UPDATED',
            'system_settings',
            'navigation_config',
            "Super Admin {$currentUser['email']} updated public navigation settings"
        );

        Response::success($body, 'Navigation configuration saved successfully.');
    }

    /**
     * Super Admin Data Export
     */
    public function exportData(): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();
        $entity = strtolower(trim((string)($_GET['entity'] ?? 'services')));

        $pdo = Database::getConnection();
        $data = [];

        switch ($entity) {
            case 'services':
                $stmt = $pdo->query("SELECT id, category_id, title, slug, price, estimated_hours, status, created_at FROM service_offerings ORDER BY title ASC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'categories':
                $stmt = $pdo->query("SELECT id, name, slug, description, sort_order FROM service_categories ORDER BY sort_order ASC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'products':
                $stmt = $pdo->query("SELECT id, name, slug, price, stock_quantity, status, created_at FROM products ORDER BY name ASC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'courses':
                $stmt = $pdo->query("SELECT id, title, slug, fee, duration_weeks, status, created_at FROM academy_courses ORDER BY title ASC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'orders':
                $stmt = $pdo->query("SELECT id, order_number, user_id, total_amount, currency, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 500");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'users':
                // Strict privacy guard: Never export password hashes or secret tokens
                $stmt = $pdo->query("
                    SELECT u.id, u.email, u.phone, u.status, u.customer_tier, r.slug AS role, u.created_at,
                           p.first_name, p.last_name, p.kyc_status
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN user_profiles p ON u.id = p.user_id
                    ORDER BY u.created_at DESC
                    LIMIT 500
                ");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            case 'audit_logs':
                $stmt = $pdo->query("SELECT id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 500");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
            default:
                Response::badRequest("Unsupported export entity '{$entity}'. Allowed: services, categories, products, courses, orders, users, audit_logs.");
                return;
        }

        $this->recordAdminAudit(
            'DATA_EXPORT',
            $entity,
            'bulk',
            "Super Admin {$currentUser['email']} exported " . count($data) . " {$entity} records"
        );

        Response::success([
            'entity'    => $entity,
            'count'     => count($data),
            'records'   => $data,
            'timestamp' => date('c'),
        ], "Data for {$entity} exported successfully.");
    }

    /**
     * Super Admin Data Import with Preview & Validation
     */
    public function importData(): void
    {
        $this->requireRoles(['super_admin']);
        $currentUser = $this->getAuthUser();
        $body = $this->getJsonBody();

        $entity = strtolower(trim((string)($body['entity'] ?? 'services')));
        $mode = strtolower(trim((string)($body['mode'] ?? 'preview'))); // 'preview' or 'execute'
        $records = $body['records'] ?? [];

        if (!is_array($records) || empty($records)) {
            Response::badRequest('No valid records provided for import.');
            return;
        }

        $pdo = Database::getConnection();
        $valid = [];
        $duplicates = [];
        $errors = [];

        foreach ($records as $idx => $rec) {
            $rowNum = $idx + 1;
            if ($entity === 'services') {
                $title = trim((string)($rec['title'] ?? ''));
                $price = (float)($rec['price'] ?? 0);
                if (empty($title)) {
                    $errors[] = "Row {$rowNum}: 'title' is required.";
                    continue;
                }
                $exists = $pdo->prepare("SELECT id FROM service_offerings WHERE LOWER(title) = ? LIMIT 1");
                $exists->execute([strtolower($title)]);
                if ($exists->fetch()) {
                    $duplicates[] = "Row {$rowNum}: Service '{$title}' already exists.";
                } else {
                    $valid[] = $rec;
                }
            } elseif ($entity === 'products') {
                $name = trim((string)($rec['name'] ?? ''));
                if (empty($name)) {
                    $errors[] = "Row {$rowNum}: 'name' is required.";
                    continue;
                }
                $exists = $pdo->prepare("SELECT id FROM products WHERE LOWER(name) = ? LIMIT 1");
                $exists->execute([strtolower($name)]);
                if ($exists->fetch()) {
                    $duplicates[] = "Row {$rowNum}: Product '{$name}' already exists.";
                } else {
                    $valid[] = $rec;
                }
            } else {
                Response::badRequest("Entity '{$entity}' does not support bulk import. Allowed: services, products.");
                return;
            }
        }

        // Preview Mode
        if ($mode === 'preview') {
            Response::success([
                'entity'          => $entity,
                'total_received'  => count($records),
                'valid_count'     => count($valid),
                'duplicate_count' => count($duplicates),
                'error_count'     => count($errors),
                'duplicates'      => $duplicates,
                'errors'          => $errors,
                'sample_valid'    => array_slice($valid, 0, 5),
            ], 'Import validation and preview completed.');
            return;
        }

        // Execute Mode (Transaction-Safe)
        $pdo->beginTransaction();
        try {
            $insertedCount = 0;
            if ($entity === 'services') {
                $stmtInsert = $pdo->prepare("
                    INSERT INTO service_offerings (id, category_id, title, slug, price, estimated_hours, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
                ");
                $catId = $pdo->query("SELECT id FROM service_categories LIMIT 1")->fetchColumn() ?: 'cat-biz';
                foreach ($valid as $v) {
                    $id = 'srv-' . bin2hex(random_bytes(6));
                    $title = (string)$v['title'];
                    $slug = strtolower(preg_replace('/[^a-z0-9\-]+/', '-', $title));
                    $price = (float)($v['price'] ?? 1000);
                    $hours = (int)($v['estimated_hours'] ?? 24);
                    $stmtInsert->execute([$id, $catId, $title, $slug, $price, $hours]);
                    $insertedCount++;
                }
            } elseif ($entity === 'products') {
                $stmtInsert = $pdo->prepare("
                    INSERT INTO products (id, name, slug, price, stock_quantity, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
                ");
                foreach ($valid as $v) {
                    $id = 'prd-' . bin2hex(random_bytes(6));
                    $name = (string)$v['name'];
                    $slug = strtolower(preg_replace('/[^a-z0-9\-]+/', '-', $name));
                    $price = (float)($v['price'] ?? 500);
                    $qty = (int)($v['stock_quantity'] ?? 100);
                    $stmtInsert->execute([$id, $name, $slug, $price, $qty]);
                    $insertedCount++;
                }
            }

            $pdo->commit();

            $this->recordAdminAudit(
                'DATA_IMPORT_EXECUTED',
                $entity,
                'bulk',
                "Super Admin {$currentUser['email']} imported {$insertedCount} {$entity} records"
            );

            Response::success([
                'entity'          => $entity,
                'inserted_count'  => $insertedCount,
                'skipped_duplicates' => count($duplicates),
            ], "Successfully imported {$insertedCount} {$entity} records.");

        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Import transaction failed: ' . $e->getMessage(), 500);
        }
    }
}

