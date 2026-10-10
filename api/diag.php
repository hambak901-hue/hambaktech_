<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$key = $_SERVER['HTTP_X_HAMBAK_SYSTEM_KEY'] ?? $_GET['key'] ?? '';
$validKey = 'HambakTech@2026!DeploymentAudit';

$isAuthorized = hash_equals($validKey, (string)$key);

$info = [
    'time' => date('c'),
    'file' => __FILE__,
    'dir' => __DIR__,
    'doc_root' => $_SERVER['DOCUMENT_ROOT'] ?? null,
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? null,
    'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
    'opcache_reset' => function_exists('opcache_reset') ? @opcache_reset() : false,
];

// Check autoload locations
$loc1 = dirname(__DIR__) . '/php-backend/autoload.php';
$loc2 = dirname(__DIR__, 2) . '/php-backend/autoload.php';
$info['loc1'] = ['path' => $loc1, 'exists' => file_exists($loc1)];
$info['loc2'] = ['path' => $loc2, 'exists' => file_exists($loc2)];

// Check .env locations
$env1 = dirname(__DIR__) . '/.env';
$env2 = dirname(__DIR__, 2) . '/.env';
$info['env1'] = ['path' => $env1, 'exists' => file_exists($env1)];
$info['env2'] = ['path' => $env2, 'exists' => file_exists($env2)];

if ($isAuthorized) {
    // Try to connect to DB and inspect users/roles
    $envPath = file_exists($env1) ? $env1 : (file_exists($env2) ? $env2 : null);
    if ($envPath) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $envVars = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            if (str_contains($line, '=')) {
                [$k, $v] = explode('=', $line, 2);
                $envVars[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
            }
        }

        $host = $envVars['DB_HOST'] ?? '127.0.0.1';
        $port = (int)($envVars['DB_PORT'] ?? 3306);
        $dbname = $envVars['DB_NAME'] ?? '';
        $user = $envVars['DB_USER'] ?? '';
        $pass = $envVars['DB_PASSWORD'] ?? '';

        $info['db_target'] = ['host' => $host, 'database' => $dbname, 'user' => $user];

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 5,
            ]);
            $info['db_status'] = 'CONNECTED';

            // Query roles
            $stmtRoles = $pdo->query("SELECT id, name, slug FROM roles");
            $info['roles'] = $stmtRoles->fetchAll();

            // Query users
            $stmtUsers = $pdo->query("
                SELECT u.id, u.email, u.phone, u.status, u.role_id, r.slug AS role_slug, u.created_at
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at ASC
            ");
            $info['users'] = $stmtUsers->fetchAll();

            // If action=fix_admin is requested, fix roles
            $action = $_GET['action'] ?? '';
            if ($action === 'fix_admin') {
                // Ensure super_admin role exists
                $saRole = $pdo->query("SELECT id FROM roles WHERE slug = 'super_admin'")->fetch();
                if (!$saRole) {
                    $pdo->prepare("INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at) VALUES ('role-super-admin', 'Super Administrator', 'super_admin', 'Universal access', 1, NOW(), NOW())")->execute();
                    $saRoleId = 'role-super-admin';
                } else {
                    $saRoleId = $saRole['id'];
                }

                // Check admin role
                $admRole = $pdo->query("SELECT id FROM roles WHERE slug = 'admin'")->fetch();
                if (!$admRole) {
                    $pdo->prepare("INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at) VALUES ('role-admin', 'Administrator', 'admin', 'Administrative operations', 1, NOW(), NOW())")->execute();
                    $admRoleId = 'role-admin';
                } else {
                    $admRoleId = $admRole['id'];
                }

                // Update admin@hambaktech.com.ng to super_admin or admin
                $targetRole = $_GET['role'] ?? 'super_admin';
                $roleToAssign = $targetRole === 'super_admin' ? $saRoleId : $admRoleId;

                $updateStmt = $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE email = 'admin@hambaktech.com.ng'");
                $updateStmt->execute([$roleToAssign]);

                // Also ensure superadmin@hambaktech.com.ng exists
                $superAdmin = $pdo->query("SELECT id FROM users WHERE email = 'superadmin@hambaktech.com.ng'")->fetch();
                if ($superAdmin) {
                    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE email = 'superadmin@hambaktech.com.ng'")->execute([$saRoleId]);
                }

                $info['fix_result'] = "Updated admin accounts to role {$targetRole}.";
            }
        } catch (\Throwable $e) {
            $info['db_error'] = $e->getMessage();
        }
    }
}

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
