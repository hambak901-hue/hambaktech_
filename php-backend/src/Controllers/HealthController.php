<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Config\Env;
use HambakTech\Services\EmailService;
use HambakTech\Utils\Response;

class HealthController
{
    public function check(): void
    {
        $dbConnected = false;
        $dbLatencyMs = null;
        $start = microtime(true);

        try {
            $dbConnected = Database::isConnected();
            $dbLatencyMs = round((microtime(true) - $start) * 1000, 2);
        } catch (\Throwable $e) {
            $dbConnected = false;
        }

        // Test storage writeability
        $uploadDir = is_dir(dirname(__DIR__, 3) . '/storage')
            ? dirname(__DIR__, 3) . '/storage'
            : dirname(__DIR__, 2) . '/storage';
        $storageWritable = is_dir($uploadDir) && is_writable($uploadDir);

        // Check email configuration status safely without leaking secrets
        $emailService = new EmailService();
        $emailConfigured = $emailService->isConfigured();

        $overallHealthy = $dbConnected && $storageWritable;
        $httpStatus = $overallHealthy ? 200 : 503;

        $report = [
            'status'     => $overallHealthy ? 'HEALTHY' : 'DEGRADED',
            'version'    => '1.0.0',
            'target'     => parse_url(Env::get('APP_URL', 'https://business.hambaktech.com.ng'), PHP_URL_HOST) ?? 'business.hambaktech.com.ng',
            'components' => [
                'database' => [
                    'status'    => $dbConnected ? 'CONNECTED' : 'DISCONNECTED',
                    'latencyMs' => $dbLatencyMs,
                ],
                'storage' => [
                    'status'   => $storageWritable ? 'WRITABLE' : 'READ_ONLY_OR_INACCESSIBLE',
                ],
                'email' => [
                    'configured' => $emailConfigured,
                    'provider'   => 'SMTP (cPanel/Host)',
                ],
            ],
            'timestamp'  => date('c'),
        ];

        Response::json(
            data: $report,
            statusCode: $httpStatus,
            message: $overallHealthy ? 'All platform systems operational.' : 'Some platform services require attention.',
            success: $overallHealthy
        );
    }
}
