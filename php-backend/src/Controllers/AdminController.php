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
        if (strtolower($targetUser['email']) === 'hambak901@gmail.com') {
            if (isset($body['status']) && strtoupper((string)$body['status']) !== 'ACTIVE') {
                Response::error('The primary super_admin authority account cannot be suspended or deactivated.', 403, 'PROTECTED_AUTHORITY');
                return;
            }
            if (isset($body['role']) && strtolower((string)$body['role']) !== 'super_admin') {
                Response::error('The primary super_admin authority cannot be demoted.', 403, 'PROTECTED_AUTHORITY');
                return;
            }
        }

        // 2. Prevent normal administrators from altering super_admin accounts
        if (strtolower((string)$targetUser['role']) === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
            Response::error('Administrative privilege violation: Only super_admin can modify super_admin accounts.', 403, 'INSUFFICIENT_PRIVILEGE');
            return;
        }

        // 3. Prevent privilege escalation: only super_admin can promote an account to super_admin
        if (isset($body['role'])) {
            $requestedRole = strtolower(trim((string)$body['role']));
            if ($requestedRole === 'super_admin' && !$this->isSuperAdmin($currentUser)) {
                Response::error('Privilege escalation rejected: Only the existing super_admin authority may assign the super_admin role.', 403, 'PRIVILEGE_ESCALATION_BLOCKED');
                return;
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

        if (isset($body['role'])) {
            $roleSlug = strtolower(trim((string)$body['role']));
            $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE slug = ?");
            $roleStmt->execute([$roleSlug]);
            $roleId = $roleStmt->fetchColumn();
            if ($roleId) {
                $stmt = $pdo->prepare("UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$roleId, $userId]);
            }
        }

        // Audit log entry
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

        if (strtolower($targetUser['email']) === 'hambak901@gmail.com' && $status !== 'ACTIVE') {
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

        if (strtolower($target['email']) === 'hambak901@gmail.com') {
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
}
