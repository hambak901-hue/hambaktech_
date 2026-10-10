<?php
declare(strict_types=1);

if (function_exists('opcache_reset')) {
    @opcache_reset();
}

header('Content-Type: application/json; charset=utf-8');
header('X-Engine: HambakTech-Reconcile-Root-1.0');

// Autoload
$autoloadPath = file_exists(dirname(__DIR__) . '/php-backend/autoload.php')
    ? dirname(__DIR__) . '/php-backend/autoload.php'
    : dirname(__DIR__, 2) . '/php-backend/autoload.php';
require_once $autoloadPath;

use HambakTech\Config\Database;
use HambakTech\Config\Env;

// Initialize Environment
$envPath = file_exists(dirname(__DIR__) . '/.env')
    ? dirname(__DIR__) . '/.env'
    : dirname(__DIR__, 2) . '/.env';
Env::load($envPath);

// Security Check
$key = $_SERVER['HTTP_X_HAMBAK_SYSTEM_KEY'] ?? $_GET['key'] ?? $_GET['system_key'] ?? '';
$validKey = 'HambakTech@2026!DeploymentAudit';

if (!hash_equals($validKey, (string)$key)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'FORBIDDEN',
        'message' => 'Invalid system authentication key.'
    ]);
    exit;
}

try {
    $pdo = Database::getConnection();
    $dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    // 1. Ensure Roles
    $saRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'super_admin'")->fetchColumn();
    if (!$saRoleId) {
        $saRoleId = 'role-super-admin';
        $pdo->prepare("INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at) VALUES (?, 'Super Administrator', 'super_admin', 'Highest authority', 1, NOW(), NOW())")->execute([$saRoleId]);
    }

    $supRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'support_admin'")->fetchColumn();
    if (!$supRoleId) {
        $supRoleId = 'role-support-admin';
        $pdo->prepare("INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at) VALUES (?, 'Support Administrator', 'support_admin', 'Support Operations', 1, NOW(), NOW())")->execute([$supRoleId]);
    }

    $admRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'admin'")->fetchColumn() ?: 'role-admin';
    $mgrRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'manager'")->fetchColumn() ?: 'role-manager';
    $stfRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'staff'")->fetchColumn() ?: 'role-staff';
    $stuRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'student'")->fetchColumn() ?: 'role-student';
    $agtRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'agent'")->fetchColumn() ?: 'role-agent';
    $crpRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'corporate'")->fetchColumn() ?: 'role-corporate';
    $cusRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'customer'")->fetchColumn() ?: 'role-customer';

    // 2. Authoritative Root Super Admin: admin@hambaktech.com.ng
    $stmtAdmin = $pdo->prepare("SELECT id, email, status, role_id FROM users WHERE LOWER(email) = 'admin@hambaktech.com.ng'");
    $stmtAdmin->execute();
    $adminUser = $stmtAdmin->fetch(PDO::FETCH_ASSOC);

    if ($adminUser) {
        $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE', updated_at = NOW() WHERE id = ?")->execute([$saRoleId, $adminUser['id']]);
    } else {
        $newAdminId = 'usr-super-admin-01';
        $newAdminHash = \HambakTech\Utils\Security::hashPassword('HambakTech@2026!');
        $pdo->prepare("INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at) VALUES (?, 'admin@hambaktech.com.ng', '+2348000000002', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())")->execute([$newAdminId, $newAdminHash, $saRoleId]);
        $pdo->prepare("INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at) VALUES (?, ?, 'Permanent Root', 'SuperAdmin', 'TIER_3', 'VERIFIED', NOW(), NOW()) ON DUPLICATE KEY UPDATE first_name='Permanent Root', last_name='SuperAdmin'")->execute(['prof-super-admin-01', $newAdminId]);
        $pdo->prepare("INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at) VALUES (?, ?, 1000000.00, 1000000.00, 'NGN', 'ACTIVE', NOW(), NOW()) ON DUPLICATE KEY UPDATE status='ACTIVE'")->execute(['wal-super-admin-01', $newAdminId]);
    }

    // 3. Secondary Super Admin: hambak901@gmail.com
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'hambak901@gmail.com'")->execute([$saRoleId]);

    // 4. Support Admin: support@hambaktech.com.ng
    $stmtSup = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = 'support@hambaktech.com.ng'");
    $stmtSup->execute();
    $supUser = $stmtSup->fetch(PDO::FETCH_ASSOC);
    if ($supUser) {
        $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE id = ?")->execute([$supRoleId, $supUser['id']]);
    } else {
        $newSupId = 'usr-support-admin-01';
        $newSupHash = \HambakTech\Utils\Security::hashPassword('HambakTech@2026!');
        $pdo->prepare("INSERT INTO users (id, email, phone, password_hash, status, customer_tier, email_verified_at, role_id, created_at, updated_at) VALUES (?, 'support@hambaktech.com.ng', '+2348000000008', ?, 'ACTIVE', 'CORPORATE', NOW(), ?, NOW(), NOW())")->execute([$newSupId, $newSupHash, $supRoleId]);
        $pdo->prepare("INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at) VALUES (?, ?, 'Support', 'Admin', 'TIER_3', 'VERIFIED', NOW(), NOW()) ON DUPLICATE KEY UPDATE first_name='Support', last_name='Admin'")->execute(['prof-support-admin-01', $newSupId]);
        $pdo->prepare("INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at) VALUES (?, ?, 250000.00, 250000.00, 'NGN', 'ACTIVE', NOW(), NOW()) ON DUPLICATE KEY UPDATE status='ACTIVE'")->execute(['wal-support-admin-01', $newSupId]);
    }

    // 5. Standard Staff, Manager, Student, Agent, Corporate
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'staff@hambaktech.com.ng'")->execute([$stfRoleId]);
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'manager@hambaktech.com.ng'")->execute([$mgrRoleId]);
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'student@hambaktech.com.ng'")->execute([$stuRoleId]);
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'agent@hambaktech.com.ng'")->execute([$agtRoleId]);
    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE LOWER(email) = 'corporate@hambaktech.com.ng'")->execute([$crpRoleId]);

    // 6. Clean up temporary probe/test accounts if requested
    $cleanedCount = 0;
    if (isset($_GET['clean']) && $_GET['clean'] === '1') {
        $stmtQA = $pdo->query("SELECT id, email FROM users WHERE (email LIKE 'test_%@example.com' OR email LIKE 'probe_%@hambaktech.com.ng') AND email NOT IN ('admin@hambaktech.com.ng', 'hambak901@gmail.com', 'support@hambaktech.com.ng', 'manager@hambaktech.com.ng', 'staff@hambaktech.com.ng', 'customer@hambaktech.com.ng', 'student@hambaktech.com.ng', 'agent@hambaktech.com.ng', 'corporate@hambaktech.com.ng')");
        foreach ($stmtQA->fetchAll(PDO::FETCH_ASSOC) as $qa) {
            $qid = $qa['id'];
            $pdo->prepare("DELETE FROM user_profiles WHERE user_id = ?")->execute([$qid]);
            $pdo->prepare("DELETE FROM wallets WHERE user_id = ?")->execute([$qid]);
            $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ?")->execute([$qid]);
            $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$qid]);
            $cleanedCount++;
        }
    }

    // 7. Audit all accounts and roles
    $accounts = $pdo->query("
        SELECT u.id, u.email, u.status, r.slug AS role, u.customer_tier
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY r.slug ASC, u.email ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    if (function_exists('opcache_reset')) {
        @opcache_reset();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Authoritative Permanent Super Admin reconciliation executed successfully.',
        'database' => $dbName,
        'table_count' => count($tables),
        'tables' => $tables,
        'qa_cleaned' => $cleanedCount,
        'accounts' => $accounts,
        'timestamp' => date('c'),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'DATABASE_ERROR',
        'message' => $e->getMessage()
    ]);
}
