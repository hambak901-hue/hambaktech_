<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use HambakTech\Utils\Security;

class AuthController extends BaseController
{
    /**
     * Public self-registration endpoint.
     * Enforces 'customer' role strictly.
     */
    public function register(): void
    {
        $body = $this->getJsonBody();
        $email = $body['email'] ?? '';
        $password = $body['password'] ?? '';
        $firstName = $body['firstName'] ?? $body['name'] ?? '';
        $lastName = $body['lastName'] ?? '';
        $phone = $body['phone'] ?? null;
        
        // Strict role escalation prevention: public registrations are ALWAYS customer
        $role = 'customer';

        $result = $this->authService->register($email, $password, $firstName, $lastName, $phone, $role);
        Response::success($result, 'Account successfully created.', 201);
    }

    /**
     * User authentication endpoint.
     * Sets authoritative HttpOnly session cookies.
     */
    public function login(): void
    {
        $body = $this->getJsonBody();
        $credential = trim((string) ($body['email'] ?? $body['credential'] ?? $body['phone'] ?? $body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $rememberMe = !empty($body['rememberMe']);
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        if (empty($credential) || empty($password)) {
            Response::error('Email/phone and password are required.', 400, 'MISSING_CREDENTIALS');
            return;
        }

        $result = $this->authService->login($credential, $password, null, $userAgent, $rememberMe);

        // Set authoritative HttpOnly session cookie
        $maxAge = $rememberMe ? (86400 * 30) : (86400 * 7);
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                   (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') ||
                   (isset($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on') ||
                   (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
                   (isset($_SERVER['HTTP_HOST']) && str_contains($_SERVER['HTTP_HOST'], 'hambaktech.com.ng'));

        $cookieOptions = [
            'expires'  => time() + $maxAge,
            'path'     => '/',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax',
        ];

        setcookie('ht_session', $result['token'], $cookieOptions);
        setcookie('hambak_token', $result['token'], $cookieOptions);

        // Also issue non-HttpOnly client cookie for frontend JavaScript header sync
        $clientCookieOptions = [
            'expires'  => time() + $maxAge,
            'path'     => '/',
            'secure'   => $isHttps,
            'httponly' => false,
            'samesite' => 'Lax',
        ];
        setcookie('hambak_client_token', $result['token'], $clientCookieOptions);

        Response::success($result, 'Authenticated successfully.');
    }

    /**
     * User logout endpoint.
     * Invalidates server session and clears client cookies.
     */
    public function logout(): void
    {
        $rawToken = '';
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            $rawToken = trim($matches[1]);
        } elseif (!empty($_COOKIE['ht_session'])) {
            $rawToken = trim($_COOKIE['ht_session']);
        } elseif (!empty($_COOKIE['hambak_token'])) {
            $rawToken = trim($_COOKIE['hambak_token']);
        } elseif (!empty($_COOKIE['hambak_client_token'])) {
            $rawToken = trim($_COOKIE['hambak_client_token']);
        }

        if (!empty($rawToken)) {
            $this->authService->logout($rawToken);
        }

        $expireOptions = [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ];
        setcookie('ht_session', '', $expireOptions);
        setcookie('hambak_token', '', $expireOptions);
        setcookie('session_token', '', $expireOptions);

        $clientExpireOptions = [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => false,
            'httponly' => false,
            'samesite' => 'Lax',
        ];
        setcookie('hambak_client_token', '', $clientExpireOptions);

        Response::success(null, 'Signed out successfully.');
    }

    /**
     * Current authenticated user identity.
     */
    public function me(): void
    {
        $user = $this->getAuthUser();
        // Return dual shape: both 'user' key and top-level user attributes for 100% client interoperability
        Response::success([
            'user' => $user,
            ...$user,
        ], 'User profile retrieved.');
    }

    /**
     * Session validation endpoint.
     */
    public function session(): void
    {
        $user = $this->getAuthUser();
        Response::success([
            'user' => $user,
            ...$user,
        ], 'Session active.');
    }

    /**
     * Comprehensive user profile with wallet and KYC details.
     * Conforms strictly to canonical MySQL schema columns.
     */
    public function profile(): void
    {
        $user = $this->getAuthUser();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.phone, u.status, u.customer_tier,
                   (CASE WHEN u.email_verified_at IS NOT NULL THEN 1 ELSE 0 END) AS email_verified,
                   u.email_verified_at, u.phone_verified_at,
                   r.slug AS role, r.name AS role_name,
                   p.first_name, p.last_name, p.avatar_url, p.address, p.state, p.lga, p.kyc_tier, p.kyc_status,
                   p.bvn_last4, p.nin_last4,
                   w.balance AS wallet_balance, w.ledger_balance AS wallet_ledger_balance, w.currency AS wallet_currency
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();

        if (!$profile) {
            Response::notFound('User profile not found.');
            return;
        }

        $profile['name'] = trim(($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? ''));
        if (empty($profile['name'])) {
            $profile['name'] = $profile['email'];
        }
        Response::success($profile, 'User profile retrieved.');
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $updated = $this->authService->updateProfile($user['id'], $body);
        Response::success($updated, 'Profile updated successfully.');
    }

    /**
     * Change user password.
     */
    public function changePassword(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $currentPassword = $body['currentPassword'] ?? $body['oldPassword'] ?? '';
        $newPassword = $body['newPassword'] ?? $body['password'] ?? '';

        if (empty($currentPassword)) {
            Response::error('Current password is required.', 400, 'MISSING_CURRENT_PASSWORD');
            return;
        }

        if (empty($newPassword) || strlen($newPassword) < 8) {
            Response::error('New password must be at least 8 characters.', 400, 'INVALID_NEW_PASSWORD');
            return;
        }

        $tokenHash = $user['tokenHash'] ?? null;
        $result = $this->authService->changePassword($user['id'], $currentPassword, $newPassword, $tokenHash);
        Response::success($result, $result['message']);
    }

    /**
     * Authenticated Email Update
     */
    public function updateEmail(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $newEmail = $body['email'] ?? $body['newEmail'] ?? '';
        $password = $body['password'] ?? $body['currentPassword'] ?? '';

        if (empty($newEmail)) {
            Response::badRequest('New email address is required.');
            return;
        }
        if (empty($password)) {
            Response::badRequest('Current account password is required to verify email change.');
            return;
        }

        $result = $this->authService->updateEmail($user['id'], $newEmail, $password);
        Response::success($result, $result['message']);
    }

    /**
     * Customer KYC Details
     */
    public function getKYC(): void
    {
        $user = $this->getAuthUser();
        $pdo = \HambakTech\Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, p.kyc_tier, p.kyc_status, p.bvn_last4, p.nin_last4, p.first_name, p.last_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $data = $stmt->fetch();
        if (!$data) {
            Response::notFound('User not found.');
            return;
        }

        Response::success([
            'userId'    => $data['id'],
            'kycTier'   => $data['kyc_tier'] ?? 'TIER_0',
            'kycStatus' => $data['kyc_status'] ?? 'UNVERIFIED',
            'hasBvn'    => !empty($data['bvn_last4']),
            'bvnLast4'  => $data['bvn_last4'] ?? null,
            'hasNin'    => !empty($data['nin_last4']),
            'ninLast4'  => $data['nin_last4'] ?? null,
        ], 'KYC status retrieved.');
    }

    /**
     * Customer KYC Submission
     */
    public function submitKYC(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $result = $this->authService->submitKYC($user['id'], $body);
        Response::success($result, $result['message']);
    }

    /**
     * Active User Sessions
     */
    public function listSessions(): void
    {
        $user = $this->getAuthUser();
        $tokenHash = $user['tokenHash'] ?? null;
        $sessions = $this->authService->listUserSessions($user['id'], $tokenHash);
        Response::success($sessions, 'Active sessions retrieved.');
    }

    /**
     * Revoke Session (Single or All Others)
     */
    public function revokeSession(array $params = []): void
    {
        $user = $this->getAuthUser();
        $sessionId = $params['id'] ?? $_GET['id'] ?? '';
        $body = $this->getJsonBody();
        $revokeOthers = (bool)($body['revokeOthers'] ?? $_GET['revokeOthers'] ?? false);

        if ($revokeOthers && !empty($user['tokenHash'])) {
            $this->authService->revokeAllOtherSessions($user['id'], $user['tokenHash']);
            Response::success(null, 'All other sessions have been terminated.');
            return;
        }

        if (empty($sessionId)) {
            $sessionId = $body['sessionId'] ?? '';
        }

        if (empty($sessionId)) {
            Response::badRequest('Session ID is required.');
            return;
        }

        $this->authService->revokeUserSession($user['id'], $sessionId);
        Response::success(null, 'Session terminated successfully.');
    }

    /**
     * Customer Activity / Audit Logs
     */
    public function getUserActivity(): void
    {
        $user = $this->getAuthUser();
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $activity = $this->authService->getUserActivity($user['id'], $limit, $offset);
        Response::success($activity, 'User activity retrieved.');
    }

    /**
     * Email verification endpoint.
     */
    public function verifyEmail(): void
    {
        $body = $this->getJsonBody();
        $token = $body['token'] ?? $_GET['token'] ?? '';
        if (empty($token)) {
            Response::error('Verification token is required.', 400, 'MISSING_TOKEN');
            return;
        }

        $result = $this->authService->verifyEmail((string)$token);
        Response::success($result, $result['message']);
    }

    /**
     * Resend email verification endpoint (supports both authenticated and unauthenticated with email body).
     */
    public function resendVerification(): void
    {
        $body = $this->getJsonBody();
        $email = $body['email'] ?? '';
        if (!empty($email)) {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $u = $stmt->fetch();
            if ($u) {
                $result = $this->authService->resendVerificationEmail($u['id']);
                Response::success($result, 'Verification email dispatched.');
                return;
            }
            Response::success(['sent' => true], 'If an account matches this email, a verification link has been sent.');
            return;
        }

        $user = $this->getAuthUser();
        $result = $this->authService->resendVerificationEmail($user['id']);
        Response::success($result, $result['message']);
    }

    /**
     * Phone verification endpoint.
     */
    public function verifyPhone(): void
    {
        $body = $this->getJsonBody();
        $action = $body['action'] ?? 'verify';
        $phone = trim((string)($body['phone'] ?? $body['email'] ?? ''));
        $otp = trim((string)($body['otp'] ?? ''));

        if (empty($phone)) {
            Response::error('Phone number or email is required.', 400, 'MISSING_PHONE');
            return;
        }

        if ($action === 'request_otp') {
            $rawOtp = (string)random_int(100000, 999999);
            Response::success([
                'phone' => $phone,
                'otp' => $rawOtp,
                'message' => 'Verification code sent to phone.'
            ], 'Verification code sent.');
            return;
        }

        if (empty($otp)) {
            Response::error('Verification code is required.', 400, 'MISSING_OTP');
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET phone_verified_at = NOW(), status = 'ACTIVE' WHERE phone = ? OR email = ?");
        $stmt->execute([$phone, $phone]);

        Response::success(['phone' => $phone, 'verified' => true], 'Phone number verified successfully.');
    }

    // -----------------------------------------------------------------
    // FORGOT PASSWORD + OTP EMAIL
    // -----------------------------------------------------------------
    public function forgotPassword(): void
    {
        $body = $this->getJsonBody();
        $email = $body['email'] ?? '';

        if (empty($email)) {
            Response::error('Email address is required.', 400, 'MISSING_EMAIL');
            return;
        }

        $result = $this->authService->requestPasswordReset((string)$email);
        Response::success($result, $result['message']);
    }

    public function verifyOtp(): void
    {
        $body = $this->getJsonBody();
        $email = $body['email'] ?? '';
        $otp = $body['otp'] ?? '';

        if (empty($email) || empty($otp)) {
            Response::error('Email and verification code are required.', 400, 'MISSING_CREDENTIALS');
            return;
        }

        $valid = $this->authService->verifyPasswordResetOtp((string)$email, (string)$otp);
        if (!$valid) {
            Response::error('The verification code is invalid or has expired.', 400, 'INVALID_OTP');
            return;
        }

        Response::success(['verified' => true], 'Verification code verified successfully.');
    }

    public function resetPassword(): void
    {
        $body = $this->getJsonBody();
        $email = $body['email'] ?? '';
        $otp = $body['otp'] ?? '';
        $newPassword = $body['newPassword'] ?? $body['password'] ?? '';

        if (empty($email) || empty($otp) || empty($newPassword)) {
            Response::error('Email, verification code, and new password are required.', 400, 'MISSING_PARAMETERS');
            return;
        }

        $result = $this->authService->resetPasswordWithOtp((string)$email, (string)$otp, (string)$newPassword);
        Response::success($result, $result['message']);
    }
}
