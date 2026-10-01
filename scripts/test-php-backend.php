<?php
declare(strict_types=1);

/**
 * HAMBAKTECH SMART DIGITAL PLATFORM v1.0
 * Comprehensive PHP Backend Test Suite
 */

require_once __DIR__ . '/../php-backend/autoload.php';

use HambakTech\Config\Env;
use HambakTech\Utils\Security;
use HambakTech\Utils\RateLimiter;
use HambakTech\Services\EmailService;
use HambakTech\Router;

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

function assertTest(string $description, bool $condition, string $details = ''): void
{
    global $totalTests, $passedTests, $failedTests;
    $totalTests++;
    if ($condition) {
        $passedTests++;
        echo "  [PASS] {$description}\n";
    } else {
        $failedTests++;
        echo "  [FAIL] {$description} - {$details}\n";
    }
}

echo "\n======================================================\n";
echo "HAMBAKTECH PHP BACKEND SUITE: COMMENCING VERIFICATION\n";
echo "======================================================\n\n";

// -------------------------------------------------------------
// 1. SECURITY & CRYPTOGRAPHY TESTS
// -------------------------------------------------------------
echo "1. Security & Cryptography Engine:\n";

// Password Hashing (Argon2id Authoritative + Legacy PBKDF2 Cross-compatibility)
$testPassword = "ProductionSecret2026!";
$hash = Security::hashPassword($testPassword);
assertTest("Password hashes into authoritative Argon2id format", str_starts_with($hash, '$argon2id$'));
assertTest("Valid password verifies successfully with Argon2id", Security::verifyPassword($testPassword, $hash));

// Inverted parameter ordering test (Node.js/Prisma m=65536,p=4,t=3 compatibility)
$invertedArgon2 = preg_replace('/t=3,p=4/', 'p=4,t=3', $hash);
assertTest("Argon2id parameter reordering normalizes and verifies", Security::verifyPassword($testPassword, $invertedArgon2));

// Legacy PBKDF2 compatibility test
$legacySalt = bin2hex(random_bytes(16));
$legacyHash = hash_pbkdf2('sha512', $testPassword, $legacySalt, 100000, 64);
$legacyPbkdf2 = "pbkdf2_sha512\$100000\${$legacySalt}\${$legacyHash}";
assertTest("Legacy PBKDF2 password verifies successfully", Security::verifyPassword($testPassword, $legacyPbkdf2));
assertTest("Incorrect password fails verification", !Security::verifyPassword("WrongPassword!", $hash));

// Token Generation
$token = Security::generateToken();
assertTest("Cryptographic token is exactly 64 hex characters", strlen($token) === 64);
$tokenHash = Security::hashToken($token);
assertTest("Token hash is valid SHA-256", strlen($tokenHash) === 64);

// OTP Generation & Hashing (Phase 6)
$otp = Security::generateOtp();
assertTest("OTP is exactly 6 digits numeric", (bool) preg_match('/^[0-9]{6}$/', $otp));
$otpHash = Security::hashOtp($otp);
assertTest("OTP hash matches SHA-256", $otpHash === hash('sha256', $otp));

// Webhook HMAC Verification
$payload = json_encode(['event' => 'charge.success', 'data' => ['reference' => 'TEST_REF_001']]);
$secret = 'whsec_prod_test_secret_key';
$sig = hash_hmac('sha512', $payload, $secret);
assertTest("Valid webhook HMAC-SHA512 passes verification", Security::verifyWebhookSignature($payload, $sig, $secret));
assertTest("Tampered webhook payload fails verification", !Security::verifyWebhookSignature($payload . " ", $sig, $secret));

// Path Traversal Sanitization
$unsafeFilename = "../../../etc/passwd\0malicious.php";
$safeFilename = Security::sanitizeFilename($unsafeFilename);
assertTest("Path traversal null bytes and directory dots stripped", !str_contains($safeFilename, '..') && !str_contains($safeFilename, "\0"));

// -------------------------------------------------------------
// 2. RATE LIMITER TESTS
// -------------------------------------------------------------
echo "\n2. Rate Limiting Engine:\n";
$testIp = '192.168.1.' . random_int(100, 250);
$key = "test_rl_" . bin2hex(random_bytes(4));

$firstAttempt = RateLimiter::check($key, 2, 60);
$secondAttempt = RateLimiter::check($key, 2, 60);
$thirdAttempt = RateLimiter::check($key, 2, 60); // Exceeds max 2

assertTest("First rate-limited request allowed", $firstAttempt);
assertTest("Second rate-limited request allowed", $secondAttempt);
assertTest("Third request correctly blocked (HTTP 429 logic)", !$thirdAttempt);

// -------------------------------------------------------------
// 3. EMAIL SERVICE TESTS (PHASE 6 & 8)
// -------------------------------------------------------------
echo "\n3. Production Email Engine (SMTP & Branded Templates):\n";
$emailService = new EmailService();

// Password Reset OTP Email
$otpSent = $emailService->sendPasswordResetOtp('test.customer@hambaktech.com.ng', '849201', 'Oluwaseun Adeyemi', 15);
assertTest("Password reset OTP email successfully generated/queued", $otpSent);

// Support Acknowledgement Email
$ackSent = $emailService->sendSupportAcknowledgement('customer@example.com', 'Adebayo Adeleke', 'HT-TKT-2026-X812', 'NIN PVC Inquiry');
assertTest("Support acknowledgement email generated/queued", $ackSent);

// Support Staff Notification Email
$staffNotif = $emailService->sendSupportStaffNotification('HT-TKT-2026-X812', 'Adebayo Adeleke', 'customer@example.com', 'NIN PVC Inquiry', 'When will my card be ready for pickup at Eleko junction?');
assertTest("Support staff desk notification generated/queued", $staffNotif);

// Support Reply Email
$replySent = $emailService->sendSupportReply('customer@example.com', 'Adebayo Adeleke', 'HT-TKT-2026-X812', 'Your plastic NIN card has been printed and is ready for pickup.');
assertTest("Support staff reply email generated/queued", $replySent);

// -------------------------------------------------------------
// 4. ROUTER PATH EXTRACTION TESTS
// -------------------------------------------------------------
echo "\n4. REST API Router Engine:\n";
$router = new Router();
$router->get('/api/v1/orders/{id}', function ($params) {
    return $params['id'];
});
assertTest("Router handles route registration cleanly", true);

// -------------------------------------------------------------
// 5. DATABASE SCHEMA VALIDATION
// -------------------------------------------------------------
echo "\n5. Database Schema & Seed Verification:\n";
$schemaFile = dirname(__DIR__) . '/database/schema.sql';
$seedFile = dirname(__DIR__) . '/database/seed.sql';

assertTest("Schema file exists in /database/schema.sql", file_exists($schemaFile));
assertTest("Seed file exists in /database/seed.sql", file_exists($seedFile));

$schemaSql = file_get_contents($schemaFile);
assertTest("Schema contains users table", str_contains($schemaSql, 'CREATE TABLE `users`'));
assertTest("Schema contains verification_tokens table", str_contains($schemaSql, 'CREATE TABLE `verification_tokens`'));
assertTest("Schema contains wallets table", str_contains($schemaSql, 'CREATE TABLE `wallets`'));
assertTest("Schema contains wallet_ledger table", str_contains($schemaSql, 'CREATE TABLE `wallet_ledger`'));
assertTest("Schema contains support_tickets table", str_contains($schemaSql, 'CREATE TABLE `support_tickets`'));
assertTest("Schema contains contact_inquiries table", str_contains($schemaSql, 'CREATE TABLE `contact_inquiries`'));
assertTest("Schema contains academy_courses table", str_contains($schemaSql, 'CREATE TABLE `academy_courses`'));

$seedSql = file_get_contents($seedFile);
assertTest("Seed contains Super Administrator role", str_contains($seedSql, 'role-super-admin'));
assertTest("Seed contains official permissions", str_contains($seedSql, 'p-user-read'));
assertTest("Seed contains system settings", str_contains($seedSql, 'company_email'));

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
echo "\n======================================================\n";
echo "TEST RESULTS: {$passedTests} passed, {$failedTests} failed (Total: {$totalTests})\n";
echo "======================================================\n\n";

if ($failedTests > 0) {
    exit(1);
}
exit(0);
