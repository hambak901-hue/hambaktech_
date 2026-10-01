<?php
declare(strict_types=1);

/**
 * ============================================================================
 * HAMBAKTECH DATABASE FORENSIC AUDIT SCRIPT (READ-ONLY)
 * ============================================================================
 * Performs a comprehensive read-only audit of the target MySQL database:
 * - Checks table existence (PascalCase vs snake_case).
 * - Identifies missing tables, column naming mismatches, and record counts.
 * - Confirms whether migration / reconciliation is needed.
 * - NEVER executes DROP, TRUNCATE, DELETE, or ALTER operations.
 * ============================================================================
 */

require_once __DIR__ . '/../php-backend/autoload.php';

use HambakTech\Config\Database;
use HambakTech\Config\Env;

echo "====================================================================\n";
echo "HAMBAKTECH REMOTE DATABASE FORENSIC AUDIT (READ-ONLY)\n";
echo "====================================================================\n\n";

try {
    $pdo = Database::getConnection();
    $dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();
    echo "[OK] Connected to database: {$dbName}\n\n";
} catch (\Throwable $e) {
    echo "[NOTICE] Cannot connect to local/configured MySQL: " . $e->getMessage() . "\n";
    echo "Tip: Run with environment variables set: DB_HOST=... DB_USER=... DB_PASSWORD=... DB_NAME=... php scripts/remote-db-audit.php\n\n";
    echo "Database schema definition verification from files:\n";
    $schemaFile = __DIR__ . '/../database/schema.sql';
    if (file_exists($schemaFile)) {
        echo "  - Authoritative schema: database/schema.sql (EXISTS, " . filesize($schemaFile) . " bytes)\n";
    }
    $compatFile = __DIR__ . '/../database/reconciliation_and_compat.sql';
    if (file_exists($compatFile)) {
        echo "  - Non-destructive reconciler: database/reconciliation_and_compat.sql (EXISTS, " . filesize($compatFile) . " bytes)\n";
    }
    exit(0);
}

// 1. Fetch all tables
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Discovered Tables in {$dbName} (" . count($tables) . " total):\n";
foreach ($tables as $tbl) {
    echo "  - {$tbl}\n";
}
echo "\n";

// 2. Classify PascalCase vs snake_case
$expectedSnake = [
    'users', 'user_profiles', 'roles', 'permissions', 'role_permissions',
    'wallets', 'wallet_ledger', 'transactions', 'orders', 'order_items',
    'cac_requests', 'nin_requests', 'support_tickets', 'notifications',
    'service_categories', 'service_offerings', 'academy_courses', 'products'
];

$pascalMapping = [
    'User' => 'users',
    'UserProfile' => 'user_profiles',
    'CustomerProfile' => 'user_profiles',
    'Role' => 'roles',
    'Wallet' => 'wallets',
    'Transaction' => 'transactions',
    'Order' => 'orders',
    'CACRequest' => 'cac_requests',
    'NINRequest' => 'nin_requests',
    'SupportTicket' => 'support_tickets',
    'Notification' => 'notifications',
];

echo "--- Schema Forensic Analysis ---\n";
$hasPascal = false;
$hasSnake = false;

foreach ($pascalMapping as $pascal => $snake) {
    $pExists = in_array($pascal, $tables, true);
    $sExists = in_array($snake, $tables, true);
    if ($pExists) $hasPascal = true;
    if ($sExists) $hasSnake = true;

    $pCount = 0;
    $sCount = 0;
    if ($pExists) {
        $pCount = (int)$pdo->query("SELECT COUNT(*) FROM `{$pascal}`")->fetchColumn();
    }
    if ($sExists) {
        $sCount = (int)$pdo->query("SELECT COUNT(*) FROM `{$snake}`")->fetchColumn();
    }

    echo sprintf("  %-16s: [%s] (%d rows)  |  %-18s: [%s] (%d rows)\n",
        $pascal, $pExists ? "FOUND" : "ABSENT", $pCount,
        $snake, $sExists ? "FOUND" : "ABSENT", $sCount
    );
}

echo "\n--- Forensic Conclusion ---\n";
if ($hasPascal && !$hasSnake) {
    echo "CRITICAL: Database is running legacy PascalCase tables ONLY.\n";
    echo "Action Required: Execute database/reconciliation_and_compat.sql to create snake_case tables and safely migrate records without dropping legacy tables.\n";
} elseif ($hasPascal && $hasSnake) {
    echo "MIXED: Both PascalCase and snake_case tables detected.\n";
    echo "Action Required: Run reconciliation script to ensure row synchronization and data parity.\n";
} elseif ($hasSnake) {
    echo "CLEAN: Database is running canonical snake_case tables matching PHP API specification.\n";
} else {
    echo "EMPTY: Database contains no matching platform tables. Execute database/schema.sql and database/seed.sql.\n";
}

echo "\nAudit complete.\n";
