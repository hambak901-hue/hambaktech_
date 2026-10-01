<?php
declare(strict_types=1);

/**
 * HAMBAKTECH SMART DIGITAL PLATFORM v1.0
 * CLI Cron Job: Hourly Transaction Reconciler & Health Check
 * Execution: /usr/local/bin/php php-backend/cron/reconcile-transactions.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo "CLI execution only.\n";
    exit(1);
}

// Autoload backend
require_once dirname(__DIR__) . '/autoload.php';

use HambakTech\Config\Env;
use HambakTech\Config\Database;
use HambakTech\Utils\Logger;

// Resolve .env path
$envPath = file_exists(dirname(__DIR__, 2) . '/.env')
    ? dirname(__DIR__, 2) . '/.env'
    : dirname(__DIR__) . '/.env';

Env::load($envPath);

$startTime = microtime(true);
$timestamp = date('Y-m-d H:i:s');
echo "[{$timestamp}] Starting HambakTech hourly transaction reconciliation...\n";

try {
    $pdo = Database::getConnection();
    echo "✓ Database connection verified.\n";

    // 1. Audit pending telecom transactions older than 15 minutes
    $stmt = $pdo->prepare("
        SELECT id, reference, provider, service_type, request_id, amount, created_at 
        FROM telecom_transactions 
        WHERE status = 'PROCESSING' 
          AND created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        LIMIT 50
    ");
    $stmt->execute();
    $pendingTelecom = $stmt->fetchAll();
    $telecomCount = count($pendingTelecom);
    echo "  - Identified {$telecomCount} pending telecom transactions requiring audit.\n";

    // 2. Audit pending wallet funding transactions older than 30 minutes
    $stmt = $pdo->prepare("
        SELECT id, reference, payment_method, amount, created_at 
        FROM wallet_funding_requests 
        WHERE status = 'PENDING' 
          AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        LIMIT 50
    ");
    $stmt->execute();
    $pendingFunding = $stmt->fetchAll();
    $fundingCount = count($pendingFunding);
    echo "  - Identified {$fundingCount} pending wallet funding requests requiring audit.\n";

    // 3. Purge expired sessions older than 30 days
    $stmt = $pdo->prepare("
        DELETE FROM user_sessions 
        WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $purgedSessions = $stmt->rowCount();
    echo "  - Purged {$purgedSessions} expired user sessions.\n";

    $duration = round(microtime(true) - $startTime, 3);
    echo "[{$timestamp}] Reconciliation completed successfully in {$duration}s.\n";

} catch (\Throwable $e) {
    echo "ERROR during reconciliation: " . $e->getMessage() . "\n";
    error_log("[Cron Error] Transaction reconciliation failure: " . $e->getMessage());
    exit(1);
}
