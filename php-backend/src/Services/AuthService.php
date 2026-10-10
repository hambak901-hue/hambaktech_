<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Database;
use HambakTech\Config\Env;
use HambakTech\Utils\Security;
use HambakTech\Utils\RateLimiter;
use PDO;
use RuntimeException;

/**
 * Authoritative Authentication & Authorization Engine
 * Handles registration, credential verification, session management,
 * email verification, password reset OTPs, and RBAC permission enforcement.
 */
class AuthService
{
    private EmailService $emailService;

    public function __construct(?EmailService $emailService = null)
    {
        $this->emailService = $emailService ?? new EmailService();
    }

    /**
     * User registration with immediate profile, wallet, verification token, and welcome email.
     * Public self-registration is strictly locked to 'customer' role.
     */
    public function register(
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        ?string $phone = null,
        string $roleSlug = 'customer'
    ): array {
        $email = strtolower(trim($email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException("A valid email address is required.", 400);
        }

        if (strlen($password) < 8) {
            throw new RuntimeException("Password must be at least 8 characters long.", 400);
        }

        $firstName = trim($firstName);
        $lastName = trim($lastName);
        if (empty($firstName) || empty($lastName)) {
            throw new RuntimeException("First name and last name are required.", 400);
        }

        $phone = !empty($phone) ? trim($phone) : null;

        // Security: Public registrations are forced to customer role.
        // Privilege escalation via unauthenticated payload is strictly blocked.
        $roleSlug = 'customer';

        return Database::transaction(function (PDO $pdo) use ($email, $password, $firstName, $lastName, $phone, $roleSlug) {
            // Check existing email
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                throw new RuntimeException("An account with this email address already exists.", 409);
            }

            // Check existing phone if provided
            if ($phone !== null) {
                $stmtPhone = $pdo->prepare("SELECT id FROM users WHERE phone = ? LIMIT 1");
                $stmtPhone->execute([$phone]);
                if ($stmtPhone->fetch()) {
                    throw new RuntimeException("An account with this phone number already exists.", 409);
                }
            }

            // Get authoritative role
            $stmtRole = $pdo->prepare("SELECT id, slug, name FROM roles WHERE slug = ? LIMIT 1");
            $stmtRole->execute([$roleSlug]);
            $role = $stmtRole->fetch();
            if (!$role) {
                $stmtRole->execute(['customer']);
                $role = $stmtRole->fetch();
            }
            $roleId = $role['id'];

            $userId = 'usr-' . bin2hex(random_bytes(10));
            $passwordHash = Security::hashPassword($password);

            // Insert into canonical users table
            $stmtUser = $pdo->prepare("
                INSERT INTO users (id, email, phone, password_hash, status, customer_tier, role_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', 'STANDARD', ?, NOW(), NOW())
            ");
            $stmtUser->execute([$userId, $email, $phone, $passwordHash, $roleId]);

            // Create canonical user_profiles record
            $profileId = 'prof-' . bin2hex(random_bytes(10));
            $stmtProfile = $pdo->prepare("
                INSERT INTO user_profiles (id, user_id, first_name, last_name, kyc_tier, kyc_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'TIER_0', 'UNVERIFIED', NOW(), NOW())
            ");
            $stmtProfile->execute([$profileId, $userId, $firstName, $lastName]);

            // Create authoritative double-entry wallet
            $walletId = 'wal-' . bin2hex(random_bytes(10));
            $stmtWallet = $pdo->prepare("
                INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at)
                VALUES (?, ?, 0.00, 0.00, 'NGN', 'ACTIVE', NOW(), NOW())
            ");
            $stmtWallet->execute([$walletId, $userId]);

            // Generate email verification token (valid for 24 hours)
            $rawVerificationToken = Security::generateToken();
            $tokenHash = Security::hashToken($rawVerificationToken);
            $tokenId = 'tok-' . bin2hex(random_bytes(10));
            $expiresAt = date('Y-m-d H:i:s', time() + 86400);

            $stmtTok = $pdo->prepare("
                INSERT INTO verification_tokens (id, user_id, token_hash, type, expires_at, is_used, created_at)
                VALUES (?, ?, ?, 'EMAIL_VERIFICATION', ?, 0, NOW())
            ");
            $stmtTok->execute([$tokenId, $userId, $tokenHash, $expiresAt]);

            // Audit log
            $ip = RateLimiter::getClientIp();
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'REGISTER_SUCCESS', 'users', ?, ?, 'Customer self-registration completed', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $stmtLog->execute([$logId, $userId, trim("{$firstName} {$lastName}"), $email, $userId, $ip]);

            // Dispatch welcome & verification emails
            try {
                $this->emailService->sendWelcomeEmail($email, $firstName);
                $this->emailService->sendEmailVerification($email, $rawVerificationToken, $firstName);
            } catch (\Throwable $e) {
                error_log("[AuthService] Registration email dispatch notice: " . $e->getMessage());
            }

            return [
                'id'                => $userId,
                'email'             => $email,
                'firstName'         => $firstName,
                'lastName'          => $lastName,
                'name'              => trim("{$firstName} {$lastName}"),
                'role'              => 'customer',
                'roleSlug'          => 'customer',
                'canonicalRole'     => 'CUSTOMER',
                'verificationToken' => $rawVerificationToken,
            ];
        });
    }

    /**
     * Authenticates user credentials and generates a 64-character session token.
     * Supports credential login via email or registered phone number.
     */
    public function login(string $credential, string $password, ?string $ip = null, ?string $userAgent = null, bool $rememberMe = false): array
    {
        $credential = trim($credential);
        $ip = $ip ?? RateLimiter::getClientIp();

        // Rate limit: 10 login attempts per 5 minutes per IP
        if (!RateLimiter::check("login_ip_{$ip}", 10, 300)) {
            throw new RuntimeException("Too many login attempts from this connection. Please wait 5 minutes before trying again.", 429);
        }

        // Credential-specific rate limit: 5 attempts per 5 minutes
        $safeCred = md5(strtolower($credential));
        if (!RateLimiter::check("login_cred_{$safeCred}", 5, 300)) {
            throw new RuntimeException("Too many failed attempts for this account. Please wait 5 minutes before trying again.", 429);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.phone, u.password_hash, u.status, u.customer_tier, u.role_id,
                   r.slug AS role_slug, r.name AS role_name,
                   p.first_name, p.last_name, p.avatar_url, p.kyc_tier
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE LOWER(u.email) = LOWER(?) OR u.phone = ?
            LIMIT 1
        ");
        $stmt->execute([$credential, $credential]);
        $user = $stmt->fetch();

        if (!$user || !Security::verifyPassword($password, $user['password_hash'])) {
            throw new RuntimeException("Invalid email address, phone number, or password.", 401);
        }

        if ($user['status'] !== 'ACTIVE') {
            throw new RuntimeException("This account is currently {$user['status']}. Please contact HambakTech Support.", 403);
        }

        // Automatic seamless upgrade to Argon2id standard if needed
        if (Security::needsRehash($user['password_hash'])) {
            try {
                $newHash = Security::hashPassword($password);
                $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
                $updateStmt->execute([$newHash, $user['id']]);
            } catch (\Throwable $e) {
                // Non-blocking hash upgrade failure
            }
        }

        // Canonical role resolution: SUPER_ADMIN, ADMIN, SUPPORT_ADMIN, MANAGER, STAFF, CUSTOMER_SERVICE, AGENT, STUDENT, CORPORATE, CUSTOMER
        $slug = strtolower(trim((string)$user['role_slug']));
        $userEmailLower = strtolower(trim((string)$user['email']));

        // Authoritative Super Admin Guarantee for designated administrators
        if (in_array($userEmailLower, ['admin@hambaktech.com.ng', 'hambak901@gmail.com', 'superadmin@hambaktech.com.ng'], true)) {
            $slug = 'super_admin';
            if ($user['role_slug'] !== 'super_admin') {
                try {
                    $saRoleId = $pdo->query("SELECT id FROM roles WHERE slug = 'super_admin'")->fetchColumn() ?: 'role-super-admin';
                    $pdo->prepare("UPDATE users SET role_id = ?, status = 'ACTIVE' WHERE id = ?")->execute([$saRoleId, $user['id']]);
                } catch (\Throwable $e) {}
            }
        }

        $roleMap = [
            'super_admin'      => 'SUPER_ADMIN',
            'admin'            => 'ADMIN',
            'support_admin'    => 'SUPPORT_ADMIN',
            'manager'          => 'MANAGER',
            'staff'            => 'STAFF',
            'customer_service' => 'CUSTOMER_SERVICE',
            'agent'            => 'AGENT',
            'student'          => 'STUDENT',
            'corporate'        => 'CORPORATE',
            'customer'         => 'CUSTOMER',
        ];
        $canonicalRole = $roleMap[$slug] ?? 'CUSTOMER';

        // Load permissions for this role
        $permissions = [];
        if ($slug === 'super_admin') {
            $permissions = ['*'];
        } else {
            $stmtPerms = $pdo->prepare("
                SELECT p.slug
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.role_id = ?
            ");
            $stmtPerms->execute([$user['role_id']]);
            $permissions = $stmtPerms->fetchAll(PDO::FETCH_COLUMN) ?: [];
        }

        // Generate high-entropy 64-character session token
        $rawToken = Security::generateToken();
        $tokenHash = Security::hashToken($rawToken);
        $sessionId = 'sess-' . bin2hex(random_bytes(10));
        $ttlSeconds = $rememberMe ? (86400 * 30) : (86400 * 7); // 30 days or 7 days
        $expiresTimestamp = time() + $ttlSeconds;
        $expiresAt = date('Y-m-d H:i:s', $expiresTimestamp);
        $expiresIso = date('c', $expiresTimestamp);

        $stmtSession = $pdo->prepare("
            INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, is_revoked, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
        ");
        $stmtSession->execute([$sessionId, $user['id'], $tokenHash, $ip, $userAgent, $expiresAt]);

        $fullName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
        if (empty($fullName)) {
            $fullName = $user['email'];
        }

        // Audit log
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, user_agent, details, created_at)
            VALUES (?, ?, ?, ?, 'LOGIN_SUCCESS', 'user_sessions', ?, ?, ?, 'User signed in successfully', NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $stmtLog->execute([$logId, $user['id'], $fullName, $user['email'], $sessionId, $ip, $userAgent]);

        return [
            'token'     => $rawToken,
            'user'      => [
                'id'            => $user['id'],
                'email'         => $user['email'],
                'phone'         => $user['phone'],
                'name'          => $fullName,
                'firstName'     => $user['first_name'] ?? 'User',
                'lastName'      => $user['last_name'] ?? '',
                'role'          => $slug,
                'roleSlug'      => $slug,
                'canonicalRole' => $canonicalRole,
                'roleId'        => $user['role_id'],
                'customerTier'  => $user['customer_tier'],
                'kycTier'       => $user['kyc_tier'] ?? 'TIER_0',
                'permissions'   => $permissions,
            ],
            'expiresAt' => $expiresIso,
        ];
    }

    /**
     * Resolves authenticated user from Bearer token in the Authorization header or session cookies.
     */
    public function authenticateRequest(): array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!$header && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        $rawToken = '';
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            $rawToken = trim($matches[1]);
        } elseif (!empty($_COOKIE['ht_session'])) {
            $rawToken = trim($_COOKIE['ht_session']);
        } elseif (!empty($_COOKIE['hambak_token'])) {
            $rawToken = trim($_COOKIE['hambak_token']);
        } elseif (!empty($_COOKIE['session_token'])) {
            $rawToken = trim($_COOKIE['session_token']);
        }

        if (empty($rawToken)) {
            throw new RuntimeException("Authentication credentials missing or malformed.", 401);
        }

        $tokenHash = Security::hashToken($rawToken);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT s.id AS session_id, s.user_id, s.expires_at, s.is_revoked,
                   u.email, u.phone, u.status, u.customer_tier, u.role_id,
                   r.slug AS role_slug, r.name AS role_name,
                   p.first_name, p.last_name, p.avatar_url, p.kyc_tier
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE s.token_hash = ? AND s.is_revoked = 0 AND s.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([$tokenHash]);
        $session = $stmt->fetch();

        if (!$session) {
            throw new RuntimeException("Session is invalid or has expired. Please sign in again.", 401);
        }

        if ($session['status'] !== 'ACTIVE') {
            throw new RuntimeException("Account access is restricted ({$session['status']}).", 403);
        }

        $slug = strtolower(trim((string)$session['role_slug']));
        $sessionEmailLower = strtolower(trim((string)$session['email']));

        if (in_array($sessionEmailLower, ['admin@hambaktech.com.ng', 'hambak901@gmail.com', 'superadmin@hambaktech.com.ng'], true)) {
            $slug = 'super_admin';
        }

        $roleMap = [
            'super_admin'      => 'SUPER_ADMIN',
            'admin'            => 'ADMIN',
            'support_admin'    => 'SUPPORT_ADMIN',
            'manager'          => 'MANAGER',
            'staff'            => 'STAFF',
            'customer_service' => 'CUSTOMER_SERVICE',
            'agent'            => 'AGENT',
            'student'          => 'STUDENT',
            'corporate'        => 'CORPORATE',
            'customer'         => 'CUSTOMER',
        ];
        $canonicalRole = $roleMap[$slug] ?? 'CUSTOMER';

        // Load permissions
        $permissions = [];
        if ($slug === 'super_admin') {
            $permissions = ['*'];
        } else {
            $stmtPerms = $pdo->prepare("
                SELECT p.slug
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.role_id = ?
            ");
            $stmtPerms->execute([$session['role_id']]);
            $permissions = $stmtPerms->fetchAll(PDO::FETCH_COLUMN) ?: [];
        }

        $fullName = trim(($session['first_name'] ?? '') . ' ' . ($session['last_name'] ?? ''));
        if (empty($fullName)) {
            $fullName = $session['email'];
        }

        return [
            'id'            => $session['user_id'],
            'email'         => $session['email'],
            'phone'         => $session['phone'],
            'name'          => $fullName,
            'firstName'     => $session['first_name'] ?? 'User',
            'lastName'      => $session['last_name'] ?? '',
            'role'          => $slug,
            'roleSlug'      => $slug,
            'canonicalRole' => $canonicalRole,
            'roleId'        => $session['role_id'],
            'customerTier'  => $session['customer_tier'],
            'kycTier'       => $session['kyc_tier'] ?? 'TIER_0',
            'sessionId'     => $session['session_id'],
            'permissions'   => $permissions,
        ];
    }

    /**
     * Revokes the active session token in the database.
     */
    public function logout(string $rawToken): bool
    {
        $tokenHash = Security::hashToken($rawToken);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE token_hash = ?");
        $stmt->execute([$tokenHash]);
        return true;
    }

    // ---------------------------------------------------------------------
    // EMAIL VERIFICATION ENGINE
    // ---------------------------------------------------------------------

    /**
     * Verifies user email address using the supplied verification token.
     */
    public function verifyEmail(string $token): array
    {
        $token = trim($token);
        if (empty($token)) {
            throw new RuntimeException("Verification token is required.", 400);
        }

        $tokenHash = Security::hashToken($token);
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT t.id AS token_id, t.user_id, t.expires_at, t.is_used, u.email, u.status
            FROM verification_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE (t.token_hash = ? OR t.token_hash = ?) AND t.type = 'EMAIL_VERIFICATION'
            ORDER BY t.created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$tokenHash, $token]);
        $record = $stmt->fetch();

        if (!$record || (int)$record['is_used'] === 1 || strtotime($record['expires_at']) < time()) {
            throw new RuntimeException("The verification link is invalid or has expired.", 400);
        }

        return Database::transaction(function (PDO $pdo) use ($record) {
            // Mark token as used
            $stmtToken = $pdo->prepare("UPDATE verification_tokens SET is_used = 1, used_at = NOW() WHERE id = ?");
            $stmtToken->execute([$record['token_id']]);

            // Update user email_verified_at and activate if pending
            $stmtUser = $pdo->prepare("
                UPDATE users
                SET email_verified_at = NOW(),
                    status = (CASE WHEN status = 'PENDING_VERIFICATION' THEN 'ACTIVE' ELSE status END),
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmtUser->execute([$record['user_id']]);

            // Audit log
            $ip = RateLimiter::getClientIp();
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, 'User', ?, 'EMAIL_VERIFICATION_SUCCESS', 'users', ?, ?, 'Email address verified successfully', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $stmtLog->execute([$logId, $record['user_id'], $record['email'], $record['user_id'], $ip]);

            return [
                'verified' => true,
                'message'  => 'Email address verified successfully.',
            ];
        });
    }

    /**
     * Resends a new email verification token.
     */
    public function resendVerificationEmail(string $userId): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.email_verified_at, p.first_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new RuntimeException("User account not found.", 404);
        }

        if (!empty($user['email_verified_at'])) {
            return [
                'message' => 'Email address is already verified.',
            ];
        }

        return Database::transaction(function (PDO $pdo) use ($user) {
            // Invalidate existing unused email verification tokens
            $stmtInv = $pdo->prepare("
                UPDATE verification_tokens
                SET is_used = 1
                WHERE user_id = ? AND type = 'EMAIL_VERIFICATION' AND is_used = 0
            ");
            $stmtInv->execute([$user['id']]);

            // Generate new token
            $rawToken = Security::generateToken();
            $tokenHash = Security::hashToken($rawToken);
            $tokenId = 'tok-' . bin2hex(random_bytes(10));
            $expiresAt = date('Y-m-d H:i:s', time() + 86400);

            $stmtIns = $pdo->prepare("
                INSERT INTO verification_tokens (id, user_id, token_hash, type, expires_at, is_used, created_at)
                VALUES (?, ?, ?, 'EMAIL_VERIFICATION', ?, 0, NOW())
            ");
            $stmtIns->execute([$tokenId, $user['id'], $tokenHash, $expiresAt]);

            $firstName = $user['first_name'] ?? 'Valued Customer';
            $this->emailService->sendEmailVerification($user['email'], $rawToken, $firstName);

            return [
                'success' => true,
                'message' => 'A new verification link has been dispatched to your email address.',
            ];
        });
    }

    // ---------------------------------------------------------------------
    // FORGOT PASSWORD + OTP EMAIL ENGINE
    // ---------------------------------------------------------------------

    /**
     * Initiates password recovery. Always returns generic success message to prevent user enumeration.
     */
    public function requestPasswordReset(string $email): array
    {
        $email = strtolower(trim($email));
        $ip = RateLimiter::getClientIp();

        // Rate limit: 5 requests per 15 minutes per IP, 3 per 15 minutes per email
        if (!RateLimiter::check("forgot_ip_{$ip}", 5, 900) || !RateLimiter::check("forgot_email_{$email}", 3, 900)) {
            throw new RuntimeException("Too many reset attempts. Please check your inbox or wait 15 minutes.", 429);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'message' => 'If this email is associated with a HambakTech account, a 6-digit verification code has been dispatched.',
            ];
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, p.first_name, p.last_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.email = ? AND u.status = 'ACTIVE'
            LIMIT 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // Invalidate any previously pending unused password reset tokens for this user
            $stmtInvalidate = $pdo->prepare("
                UPDATE verification_tokens
                SET is_used = 1
                WHERE user_id = ? AND type = 'PASSWORD_RESET' AND is_used = 0
            ");
            $stmtInvalidate->execute([$user['id']]);

            // Generate cryptographically secure 6-digit OTP
            $otp = Security::generateOtp();
            $otpHash = Security::hashOtp($otp);
            $tokenId = 'tok-' . bin2hex(random_bytes(10));
            $expiryMinutes = 15;
            $expiresAt = date('Y-m-d H:i:s', time() + ($expiryMinutes * 60));

            $stmtInsert = $pdo->prepare("
                INSERT INTO verification_tokens (id, user_id, token_hash, type, expires_at, is_used, metadata, created_at)
                VALUES (?, ?, ?, 'PASSWORD_RESET', ?, 0, ?, NOW())
            ");
            $metadata = json_encode(['ip' => $ip, 'client' => 'web']);
            $stmtInsert->execute([$tokenId, $user['id'], $otpHash, $expiresAt, $metadata]);

            // Dispatch Email via EmailService safely
            $recipientName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: 'Valued Customer';
            try {
                $this->emailService->sendPasswordResetOtp($email, $otp, $recipientName, $expiryMinutes);
            } catch (\Throwable $e) {
                error_log("[AuthService WARNING] Password reset email dispatch failed: " . $e->getMessage());
            }

            // Audit log
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'REQUEST_PASSWORD_RESET_OTP', 'users', ?, ?, 'Password reset OTP dispatched', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $stmtLog->execute([$logId, $user['id'], $recipientName, $email, $user['id'], $ip]);
        }

        return [
            'message' => 'If this email is associated with a HambakTech account, a 6-digit verification code has been dispatched.',
        ];
    }

    /**
     * Validates that OTP matches and is active.
     */
    public function verifyPasswordResetOtp(string $email, string $otp): bool
    {
        $email = strtolower(trim($email));
        $otp = trim($otp);
        $otpHash = Security::hashOtp($otp);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT t.id, t.expires_at, t.is_used, u.id AS user_id
            FROM verification_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE u.email = ? AND (t.token_hash = ? OR t.token_hash = ?) AND t.type = 'PASSWORD_RESET'
            ORDER BY t.created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$email, $otpHash, $otp]);
        $token = $stmt->fetch();

        if (!$token || (int)$token['is_used'] === 1 || strtotime($token['expires_at']) < time()) {
            return false;
        }

        return true;
    }

    /**
     * Completes password reset using verified OTP.
     */
    public function resetPasswordWithOtp(string $email, string $otp, string $newPassword): array
    {
        $email = strtolower(trim($email));
        $otp = trim($otp);

        if (strlen($newPassword) < 8) {
            throw new RuntimeException("New password must be at least 8 characters long.", 400);
        }

        $otpHash = Security::hashOtp($otp);
        $ip = RateLimiter::getClientIp();

        return Database::transaction(function (PDO $pdo) use ($email, $otpHash, $otp, $newPassword, $ip) {
            $stmt = $pdo->prepare("
                SELECT t.id AS token_id, t.expires_at, t.is_used, u.id AS user_id, p.first_name, p.last_name
                FROM verification_tokens t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.email = ? AND (t.token_hash = ? OR t.token_hash = ?) AND t.type = 'PASSWORD_RESET'
                ORDER BY t.created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$email, $otpHash, $otp]);
            $record = $stmt->fetch();

            if (!$record || (int)$record['is_used'] === 1 || strtotime($record['expires_at']) < time()) {
                throw new RuntimeException("The verification code is invalid or has expired. Please request a new code.", 400);
            }

            $userId = $record['user_id'];
            $newHash = Security::hashPassword($newPassword);

            // Update user password
            $stmtUpdate = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
            $stmtUpdate->execute([$newHash, $userId]);

            // Invalidate the OTP token
            $stmtMark = $pdo->prepare("UPDATE verification_tokens SET is_used = 1, used_at = NOW() WHERE id = ?");
            $stmtMark->execute([$record['token_id']]);

            // Revoke all existing sessions for security
            $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?");
            $stmtRevoke->execute([$userId]);

            // Audit log
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'PASSWORD_RESET_SUCCESS', 'users', ?, ?, 'Password successfully reset via verified OTP', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $actorName = trim(($record['first_name'] ?? '') . ' ' . ($record['last_name'] ?? '')) ?: 'User';
            $stmtLog->execute([$logId, $userId, $actorName, $email, $userId, $ip]);

            return [
                'success' => true,
                'message' => 'Your password has been successfully updated. You may now sign in with your new credentials.',
            ];
        });
    }

    // ---------------------------------------------------------------------
    // AUTHENTICATED PROFILE & CREDENTIAL MANAGEMENT
    // ---------------------------------------------------------------------

    /**
     * Authenticated Profile Update (Names, Phone, Address, State, LGA)
     * Strictly protects against mass assignment of roles, status, tier, or wallet balances.
     */
    public function updateProfile(string $userId, array $data): array
    {
        $pdo = Database::getConnection();

        $stmtUser = $pdo->prepare("
            SELECT u.id, u.email, u.phone, p.first_name, p.last_name, p.address, p.state, p.lga
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmtUser->execute([$userId]);
        $existing = $stmtUser->fetch();
        if (!$existing) {
            throw new RuntimeException("User account not found.", 404);
        }

        if (!isset($data['firstName']) && (isset($data['fullName']) || isset($data['name']))) {
            $rawFullName = trim((string)($data['fullName'] ?? $data['name'] ?? ''));
            $nameParts = explode(' ', $rawFullName, 2);
            $data['firstName'] = $nameParts[0] ?? '';
            if (isset($nameParts[1]) && !empty($nameParts[1])) {
                $data['lastName'] = $nameParts[1];
            }
        }

        // Security: reject forbidden administrative/financial mutations via profile endpoint
        $forbiddenKeys = ['role', 'role_id', 'status', 'customer_tier', 'customerTier', 'balance', 'wallet_balance', 'kyc_status', 'kycStatus', 'password_hash'];
        foreach ($forbiddenKeys as $key) {
            if (isset($data[$key])) {
                throw new RuntimeException("Modifying protected field '{$key}' via profile update is forbidden.", 403);
            }
        }

        $firstName = isset($data['firstName']) ? trim((string)$data['firstName']) : ($existing['first_name'] ?? '');
        $lastName = isset($data['lastName']) ? trim((string)$data['lastName']) : ($existing['last_name'] ?? '');
        $phone = isset($data['phone']) ? trim((string)$data['phone']) : ($existing['phone'] ?? null);
        $address = isset($data['address']) ? trim((string)$data['address']) : ($existing['address'] ?? null);
        $state = isset($data['state']) ? trim((string)$data['state']) : ($existing['state'] ?? 'Lagos State');
        $lga = isset($data['lga']) ? trim((string)$data['lga']) : ($existing['lga'] ?? 'Ibeju-Lekki');

        if (empty($firstName) || empty($lastName)) {
            throw new RuntimeException("First name and last name cannot be empty.", 400);
        }

        // Validate and sanitize phone format
        if ($phone !== null && $phone !== '') {
            $phone = preg_replace('/[^\d+]/', '', $phone);
            if (!preg_match('/^\+?[0-9]{10,15}$/', $phone)) {
                throw new RuntimeException("Invalid phone number format. Provide a valid 10-15 digit phone number.", 400);
            }
        }

        // Check phone uniqueness if phone is being changed
        if ($phone !== null && $phone !== '' && $phone !== $existing['phone']) {
            $stmtPhone = $pdo->prepare("SELECT id FROM users WHERE phone = ? AND id != ? LIMIT 1");
            $stmtPhone->execute([$phone, $userId]);
            if ($stmtPhone->fetch()) {
                throw new RuntimeException("This phone number is already registered to another account.", 409);
            }
        }

        return Database::transaction(function (PDO $pdo) use ($userId, $phone, $firstName, $lastName, $address, $state, $lga, $existing) {
            $fields = ['first_name = ?', 'last_name = ?', 'phone = ?', 'address = ?', 'state = ?', 'lga = ?'];
            $stmtUpUser = $pdo->prepare("UPDATE users SET phone = ?, updated_at = NOW() WHERE id = ?");
            $stmtUpUser->execute([$phone, $userId]);

            $stmtUpProf = $pdo->prepare("
                UPDATE user_profiles
                SET first_name = ?, last_name = ?, address = ?, state = ?, lga = ?, updated_at = NOW()
                WHERE user_id = ?
            ");
            $stmtUpProf->execute([$firstName, $lastName, $address, $state, $lga, $userId]);

            $ip = RateLimiter::getClientIp();
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'PROFILE_UPDATE_SUCCESS', 'users', ?, ?, 'User updated profile details', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $actorName = trim("{$firstName} {$lastName}") ?: 'User';
            $stmtLog->execute([$logId, $userId, $actorName, $existing['email'], $userId, $ip]);

            return [
                'id'        => $userId,
                'email'     => $existing['email'],
                'phone'     => $phone,
                'firstName' => $firstName,
                'lastName'  => $lastName,
                'name'      => trim("{$firstName} {$lastName}"),
                'address'   => $address,
                'state'     => $state,
                'lga'       => $lga,
            ];
        });
    }

    /**
     * Authenticated Password Change
     */
    public function changePassword(string $userId, string $currentPassword, string $newPassword, ?string $currentTokenHash = null): array
    {
        if (strlen($newPassword) < 8 || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
            throw new RuntimeException("New password must be at least 8 characters long and contain uppercase, lowercase, and a number.", 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.password_hash, p.first_name, p.last_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new RuntimeException("User account not found.", 404);
        }

        if (!Security::verifyPassword($currentPassword, $user['password_hash'])) {
            throw new RuntimeException("The current password provided is incorrect.", 400);
        }

        if ($currentPassword === $newPassword) {
            throw new RuntimeException("New password cannot be identical to the current password.", 400);
        }

        $newHash = Security::hashPassword($newPassword);
        $ip = RateLimiter::getClientIp();

        return Database::transaction(function (PDO $pdo) use ($userId, $newHash, $user, $ip, $currentTokenHash) {
            $stmtUpdate = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
            $stmtUpdate->execute([$newHash, $userId]);

            // Revoke all existing sessions (or all except current session if provided)
            if ($currentTokenHash) {
                $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ? AND token_hash != ?");
                $stmtRevoke->execute([$userId, $currentTokenHash]);
            } else {
                $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?");
                $stmtRevoke->execute([$userId]);
            }

            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'PASSWORD_CHANGE_SUCCESS', 'users', ?, ?, 'User successfully changed account password', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $actorName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: 'User';
            $stmtLog->execute([$logId, $userId, $actorName, $user['email'], $userId, $ip]);

            return [
                'success' => true,
                'message' => 'Password has been changed successfully. Other active sessions have been revoked.',
            ];
        });
    }

    /**
     * Authenticated Email Update
     */
    public function updateEmail(string $userId, string $newEmail, string $password): array
    {
        $newEmail = strtolower(trim($newEmail));
        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException("A valid email address is required.", 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.password_hash, p.first_name, p.last_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new RuntimeException("User account not found.", 404);
        }

        if (!Security::verifyPassword($password, $user['password_hash'])) {
            throw new RuntimeException("Incorrect password. Confirmation is required to update email address.", 400);
        }

        if ($user['email'] === $newEmail) {
            throw new RuntimeException("The new email address cannot be the same as your current email.", 400);
        }

        // Check if email already belongs to another user
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
        $stmtCheck->execute([$newEmail, $userId]);
        if ($stmtCheck->fetch()) {
            throw new RuntimeException("This email address is already in use by another account.", 409);
        }

        $ip = RateLimiter::getClientIp();
        return Database::transaction(function (PDO $pdo) use ($userId, $newEmail, $user, $ip) {
            $stmtUpdate = $pdo->prepare("UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?");
            $stmtUpdate->execute([$newEmail, $userId]);

            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'EMAIL_CHANGE_SUCCESS', 'users', ?, ?, ?, NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $actorName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: 'User';
            $details = "Email changed from {$user['email']} to {$newEmail}";
            $stmtLog->execute([$logId, $userId, $actorName, $newEmail, $userId, $ip, $details]);

            return [
                'success' => true,
                'email'   => $newEmail,
                'message' => 'Email address successfully updated.',
            ];
        });
    }

    /**
     * Customer KYC Submission
     */
    public function submitKYC(string $userId, array $data): array
    {
        $ninLast4 = isset($data['ninLast4']) ? trim((string)$data['ninLast4']) : null;
        $bvnLast4 = isset($data['bvnLast4']) ? trim((string)$data['bvnLast4']) : null;

        if ($ninLast4 !== null && !preg_match('/^\d{4}$/', $ninLast4)) {
            throw new RuntimeException("NIN must provide the last 4 digits.", 400);
        }
        if ($bvnLast4 !== null && !preg_match('/^\d{4}$/', $bvnLast4)) {
            throw new RuntimeException("BVN must provide the last 4 digits.", 400);
        }

        if (empty($ninLast4) && empty($bvnLast4)) {
            throw new RuntimeException("At least one identification credential (NIN or BVN last 4 digits) is required.", 400);
        }

        $pdo = Database::getConnection();
        $stmtUser = $pdo->prepare("SELECT u.id, u.email, p.first_name, p.last_name FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?");
        $stmtUser->execute([$userId]);
        $user = $stmtUser->fetch();
        if (!$user) {
            throw new RuntimeException("User not found.", 404);
        }

        $ip = RateLimiter::getClientIp();
        return Database::transaction(function (PDO $pdo) use ($userId, $ninLast4, $bvnLast4, $user, $ip) {
            $stmtUpdate = $pdo->prepare("
                UPDATE user_profiles
                SET nin_last4 = COALESCE(?, nin_last4),
                    bvn_last4 = COALESCE(?, bvn_last4),
                    kyc_status = 'PENDING',
                    updated_at = NOW()
                WHERE user_id = ?
            ");
            $stmtUpdate->execute([$ninLast4, $bvnLast4, $userId]);

            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'KYC_SUBMISSION_SUBMITTED', 'user_profiles', ?, ?, 'Customer submitted identity verification credentials for review', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $actorName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: 'User';
            $stmtLog->execute([$logId, $userId, $actorName, $user['email'], $userId, $ip]);

            return [
                'success'   => true,
                'kycStatus' => 'PENDING',
                'message'   => 'Verification details submitted successfully and queued for review.',
            ];
        });
    }

    /**
     * Active User Sessions Listing
     */
    public function listUserSessions(string $userId, ?string $currentTokenHash = null): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, ip_address, user_agent, expires_at, created_at, token_hash
            FROM user_sessions
            WHERE user_id = ? AND is_revoked = 0 AND expires_at > NOW()
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $sessions = [];
        foreach ($rows as $row) {
            $isCurrent = ($currentTokenHash !== null && hash_equals($row['token_hash'], $currentTokenHash));
            $sessions[] = [
                'id'         => $row['id'],
                'ipAddress'  => $row['ip_address'] ?? 'Unknown IP',
                'userAgent'  => $row['user_agent'] ?? 'Unknown Device / Browser',
                'createdAt'  => $row['created_at'],
                'expiresAt'  => $row['expires_at'],
                'isCurrent'  => $isCurrent,
            ];
        }

        return $sessions;
    }

    /**
     * Revoke a Specific User Session (IDOR Protected)
     */
    public function revokeUserSession(string $userId, string $sessionId): bool
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM user_sessions WHERE id = ? AND user_id = ? LIMIT 1");
        $stmt->execute([$sessionId, $userId]);
        if (!$stmt->fetch()) {
            throw new RuntimeException("Session not found or does not belong to your account.", 404);
        }

        $stmtRevoke = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE id = ? AND user_id = ?");
        $stmtRevoke->execute([$sessionId, $userId]);

        $ip = RateLimiter::getClientIp();
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, 'User', NULL, 'SESSION_REVOKED', 'user_sessions', ?, ?, 'User explicitly terminated an active login session', NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $stmtLog->execute([$logId, $userId, $sessionId, $ip]);

        return true;
    }

    /**
     * Revoke All Other User Sessions
     */
    public function revokeAllOtherSessions(string $userId, string $currentTokenHash): bool
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ? AND token_hash != ?");
        $stmt->execute([$userId, $currentTokenHash]);

        $ip = RateLimiter::getClientIp();
        $stmtLog = $pdo->prepare("
            INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
            VALUES (?, ?, 'User', NULL, 'SESSIONS_REVOKED_ALL', 'user_sessions', ?, ?, 'User revoked all other active login sessions', NOW())
        ");
        $logId = 'aud-' . bin2hex(random_bytes(10));
        $stmtLog->execute([$logId, $userId, $userId, $ip]);

        return true;
    }

    /**
     * Get Customer Activity / Audit Logs Scoped Strictly to Authenticated User
     */
    public function getUserActivity(string $userId, int $limit = 20, int $offset = 0): array
    {
        $limit = min(100, max(1, $limit));
        $offset = max(0, $offset);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, action, entity, entity_id, ip_address, details, created_at
            FROM audit_logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // ---------------------------------------------------------------------
    // RBAC PERMISSIONS ENFORCEMENT
    // ---------------------------------------------------------------------

    /**
     * Checks if a user has the specified permission slug.
     * Super Admin has absolute wildcard bypass ('*').
     */
    public function hasPermission(array $user, string $permissionSlug): bool
    {
        $roleSlug = strtolower(trim((string)($user['roleSlug'] ?? $user['role'] ?? '')));
        if ($roleSlug === 'super_admin') {
            return true;
        }

        if (isset($user['permissions']) && is_array($user['permissions'])) {
            if (in_array('*', $user['permissions'], true) || in_array($permissionSlug, $user['permissions'], true)) {
                return true;
            }
        }

        $roleId = $user['roleId'] ?? null;
        if (!$roleId) {
            return false;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS allowed
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ? AND (p.slug = ? OR p.slug = '*')
        ");
        $stmt->execute([$roleId, $permissionSlug]);
        $row = $stmt->fetch();
        return (int)($row['allowed'] ?? 0) > 0;
    }

    /**
     * Asserts permission or throws 403 Forbidden.
     */
    public function assertPermission(array $user, string $permissionSlug): void
    {
        if (!$this->hasPermission($user, $permissionSlug)) {
            throw new RuntimeException("Access denied. Insufficient permissions ({$permissionSlug}).", 403);
        }
    }
}
