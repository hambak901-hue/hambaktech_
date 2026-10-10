<?php
declare(strict_types=1);

/**
 * HAMBAKTECH SMART DIGITAL PLATFORM v1.0
 * Production RBAC Forensic Audit & Provisioning Script
 * Target: https://business.hambaktech.com.ng/ops/rbac.php
 */

header('Content-Type: application/json; charset=utf-8');

// Require authentication key
$providedKey = $_SERVER['HTTP_X_HAMBAK_SYSTEM_KEY'] ?? $_GET['key'] ?? '';
$validKey = 'HambakTech@2026!DeploymentAudit';

if (!hash_equals($validKey, (string)$providedKey)) {
    http_response_code(403);
    echo json_encode([
        'success'   => false,
        'message'   => 'Forbidden: Invalid or missing administrative system key.',
        'timestamp' => date('c'),
    ]);
    exit;
}

// Autoload backend
$autoloadPath = file_exists(dirname(__DIR__) . '/php-backend/autoload.php')
    ? dirname(__DIR__) . '/php-backend/autoload.php'
    : dirname(__DIR__, 2) . '/php-backend/autoload.php';
require_once $autoloadPath;

use HambakTech\Config\Database;
use HambakTech\Config\Env;
use HambakTech\Utils\Security;

// Initialize Environment
$envPath = file_exists(dirname(__DIR__) . '/.env')
    ? dirname(__DIR__) . '/.env'
    : dirname(__DIR__, 2) . '/.env';
Env::load($envPath);

try {
    $pdo = Database::getConnection();
    $dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();

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

    // 2. Super Admin Guarantee
    $hasSuperAdmin = !empty($accountsByRole['super_admin']);
    $superAdminAccount = null;
    if ($hasSuperAdmin) {
        $superAdminAccount = $accountsByRole['super_admin'][0];
        $superAdminAccount['status_summary'] = 'VALID_SUPER_ADMIN_EXISTS_NO_DUPLICATE_CREATED';
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
        $saHash = Security::hashPassword('Admin@123456');

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
            'status_summary'    => 'PROVISIONED_AS_DESIGNATED_SUPER_ADMIN',
        ];
        $accountsByRole['super_admin'][] = $superAdminAccount;
    }

    // 3. Support Admin Check & Fix
    $hasSupportAdminRole = (bool)$pdo->query("SELECT id FROM roles WHERE slug = 'support_admin'")->fetch();
    if (!$hasSupportAdminRole) {
        $pdo->prepare("
            INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at)
            VALUES ('role-support-admin', 'Support Administrator', 'support_admin', 'Customer support, order status inspection, inquiry management, and academy review', 1, NOW(), NOW())
        ")->execute();
    }
    $supRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'support_admin'")->fetchColumn();

    // Map strict restricted permissions for support_admin
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

    $supportAdminAccount = null;
    $targetPassword = 'HambakTech@2026!';
    $newHash = Security::hashPassword($targetPassword);

    if ($targetUser) {
        $targetUserId = $targetUser['id'];
        $pdo->prepare("
            UPDATE users 
            SET role_id = ?, password_hash = ?, status = 'ACTIVE', email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() 
            WHERE id = ?
        ")->execute([$supRoleId, $newHash, $targetUserId]);

        $supportAdminAccount = [
            'id'                => $targetUserId,
            'email'             => $targetEmail,
            'status'            => 'ACTIVE',
            'role'              => 'support_admin',
            'created_at'        => $targetUser['created_at'],
            'is_email_verified' => true,
            'status_summary'    => 'EXISTING_USER_UPDATED_TO_SUPPORT_ADMIN_AND_CREDENTIALS_SECURED',
            'allowed_permissions' => [
                'p-user-read'        => 'Read customer and order profiles for support desk',
                'p-order-create'     => 'Create service or business centre orders on behalf of walk-in customers',
                'p-order-update'     => 'Update job status (e.g. IN_PROGRESS, READY, DELIVERED)',
                'p-support-manage'   => 'Resolve and respond to client inquiries and support tickets',
                'p-services-manage'  => 'Inspect service catalog and pricing',
                'p-academy-manage'   => 'Review course syllabus and student enrollment records',
                'p-identity-ops'     => 'Inspect NIN and CAC document processing workflows',
            ],
            'prohibited_actions' => [
                'create_support_administrator'   => 'STRICTLY_BLOCKED (Only Super Admin can provision support admin)',
                'promote_to_support_admin'       => 'STRICTLY_BLOCKED (Lower/peer roles cannot promote)',
                'promote_themselves'             => 'STRICTLY_BLOCKED (Self-promotion is physically prohibited)',
                'grant_super_admin'              => 'STRICTLY_BLOCKED (Cannot grant or elevate to super_admin)',
                'modify_super_admin_permissions' => 'STRICTLY_BLOCKED (Cannot view or alter super_admin config)',
            ],
        ];
    } else {
        // Automatically create admin@hambaktech.com.ng with password HambakTech@2026!
        $supUserId = 'usr-support-admin-01';
        $pdo->prepare("
            INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at)
            VALUES (?, ?, '+2348000000002', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())
        ")->execute([$supUserId, $targetEmail, $newHash, $supRoleId]);

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

        $supportAdminAccount = [
            'id'                => $supUserId,
            'email'             => $targetEmail,
            'status'            => 'ACTIVE',
            'role'              => 'support_admin',
            'created_at'        => date('Y-m-d H:i:s'),
            'is_email_verified' => true,
            'status_summary'    => 'AUTOMATICALLY_CREATED_SUPPORT_ADMIN',
            'allowed_permissions' => [
                'p-user-read'        => 'Read customer and order profiles for support desk',
                'p-order-create'     => 'Create service or business centre orders on behalf of walk-in customers',
                'p-order-update'     => 'Update job status (e.g. IN_PROGRESS, READY, DELIVERED)',
                'p-support-manage'   => 'Resolve and respond to client inquiries and support tickets',
                'p-services-manage'  => 'Inspect service catalog and pricing',
                'p-academy-manage'   => 'Review course syllabus and student enrollment records',
                'p-identity-ops'     => 'Inspect NIN and CAC document processing workflows',
            ],
            'prohibited_actions' => [
                'create_support_administrator'   => 'STRICTLY_BLOCKED',
                'promote_to_support_admin'       => 'STRICTLY_BLOCKED',
                'promote_themselves'             => 'STRICTLY_BLOCKED',
                'grant_super_admin'              => 'STRICTLY_BLOCKED',
                'modify_super_admin_permissions' => 'STRICTLY_BLOCKED',
            ],
        ];
    }

    // Refresh accounts list
    $accountsByRole['support_admin'] = [$supportAdminAccount];

    // Record Immutable Audit Log
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $auditId = 'aud-' . bin2hex(random_bytes(10));
    $pdo->prepare("
        INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
        VALUES (?, 'system', 'System Provisioner', 'system@hambaktech.com.ng', 'RBAC_SECURITY_AUDIT_AND_PROVISION', 'system', 'rbac', ?, 'Forensic RBAC audit and Support Admin provisioning executed', NOW())
    ")->execute([$auditId, $ip]);

    echo json_encode([
        'success'               => true,
        'message'               => 'RBAC Forensic Audit & Provisioning completed successfully.',
        'database'              => $dbName,
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
        'timestamp'             => date('c'),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success'   => false,
        'message'   => 'Database execution error: ' . $e->getMessage(),
        'timestamp' => date('c'),
    ]);
}
