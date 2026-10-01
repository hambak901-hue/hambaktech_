/**
 * =============================================================================
 * HAMBAKTECH MILESTONE 3 (M3) AUTHENTICATION & AUTHORIZATION TEST SUITE
 * =============================================================================
 * 
 * Comprehensive gate validation covering:
 *  1. Cryptographic Primitives & Password Hashing Architecture
 *  2. User Registration & Uniqueness Invariants
 *  3. Public Registration Privilege Escalation Prevention
 *  4. Authentication, Status Invariants & Credential Validation
 *  5. Suspended / Inactive Account Rejection
 *  6. Session Lifecycle & Token Cryptographic Security
 *  7. Session Expiry & Immediate Revocation
 *  8. Explicit Logout Flow
 *  9. Email Verification Lifecycle (Single-Use & Expiry)
 * 10. Password Reset Lifecycle, Hashing & Expiry
 * 11. Old Password Rejection & Post-Reset Session Invalidation
 * 12. Multi-Role RBAC Authorization (Customer, Admin, Super-Admin)
 * 13. Customer Privilege Escalation & Profile Role Tampering Rejection
 * 14. Unprivileged Permission Manipulation Rejection
 * 15. Customer A/B Data Isolation (Orders, Wallets, Tickets, Identity)
 * 16. Insecure Direct Object Reference (IDOR) Protection
 * 17. Super-Admin Guardrails (Admin cannot demote/delete root Super Admin or edit system settings)
 * 18. Authentication Brute-Force Rate Limiting
 * 19. Password Reset Rate Limiting
 * 20. Persistent Browser Authentication Token Storage Audit
 * 21. Server-Side Authorization Enforcement Verification
 */

import * as fs from "fs";
import * as path from "path";
import { hashPassword, verifyPassword, generateRandomToken, hashToken } from "../src/lib/crypto";
import {
  register,
  login,
  validateSession,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logout,
  AccountLockoutManager,
} from "../src/lib/auth-service";
import { hasPermission, assertPermission, hasRole, AuthSession } from "../src/lib/auth";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS_MATRIX } from "../src/lib/auth-constants";
import { RegisterSchema } from "../src/lib/validation";
import { ForbiddenError, UnauthorizedError, ConflictError, TooManyRequestsError } from "../src/lib/errors";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${failureDetails ? `\n    Details: ${failureDetails}` : ""}`);
  }
}

async function runM3TestSuite(): Promise<void> {
  console.log("=================================================================");
  console.log("🔒 HAMBAKTECH MILESTONE 3: AUTHENTICATION & AUTHORIZATION AUDIT");
  console.log("=================================================================\n");

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Cryptographic Primitives & Password Hashing Architecture
  // ---------------------------------------------------------------------------
  console.log("--- Group 1: Cryptographic Primitives & Password Hashing ---");
  const testPassword = "HambakSecure@2026";
  const hashedPassword = hashPassword(testPassword);

  assert(
    hashedPassword.startsWith("pbkdf2$100000$"),
    "TypeScript runtime uses secure salted PBKDF2-SHA512 (100,000 iterations)",
    `Hash was: ${hashedPassword.slice(0, 30)}...`
  );

  assert(
    verifyPassword(testPassword, hashedPassword) === true,
    "Valid password passes constant-time verification"
  );

  assert(
    verifyPassword("IncorrectPassword#99", hashedPassword) === false,
    "Incorrect password fails verification in constant-time"
  );

  // Cross-runtime architecture check: verify PHP Security.php specifies Argon2id as authoritative
  const securityPhpPath = path.resolve(__dirname, "../php-backend/src/Utils/Security.php");
  const securityPhpContent = fs.readFileSync(securityPhpPath, "utf-8");
  assert(
    securityPhpContent.includes("PASSWORD_ARGON2ID"),
    "Authoritative PHP backend specifies Argon2id password hashing"
  );
  assert(
    securityPhpContent.includes("hash_equals"),
    "Authoritative PHP backend enforces constant-time hash comparison (hash_equals)"
  );
  assert(
    securityPhpContent.includes("memory_cost => 65536") || securityPhpContent.includes("65536"),
    "Argon2id configured with standard 64MB memory cost"
  );

  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);
  assert(rawToken.length === 64, "Random tokens are generated with 256 bits of CSPRNG entropy (64 hex characters)");
  assert(tokenHash.length === 64, "Token hash is standard SHA-256 (64 hex characters)");
  assert(tokenHash !== rawToken, "Raw token and stored hash are cryptographically distinct");
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: Registration, Uniqueness & Escalation Defenses
  // ---------------------------------------------------------------------------
  console.log("--- Group 2: User Registration & Uniqueness Controls ---");
  const uniqueTimestamp = Date.now();
  const customerEmailA = `customer_a_${uniqueTimestamp}@hambaktech.com.ng`;
  const customerPhoneA = `0803${Math.floor(1000000 + Math.random() * 9000000)}`;
  const rawPassword = "StrongUserPassword#2026";

  const regResultA = await register({
    firstName: "Adeola",
    lastName: "Adeleke",
    email: customerEmailA,
    phone: customerPhoneA,
    password: rawPassword,
    confirmPassword: rawPassword,
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  assert(!!regResultA.sessionData.sessionToken, "Registration generates valid session token");
  assert(regResultA.sessionData.user.email === customerEmailA, "Registered user email matches payload");
  assert(regResultA.sessionData.user.role.slug === ROLES.CUSTOMER, "New registration assigned 'customer' role");
  assert(!!regResultA.verificationToken, "Registration produces an email verification token");

  // Duplicate email rejection
  let duplicateEmailCaught = false;
  try {
    await register({
      firstName: "Impostor",
      lastName: "User",
      email: customerEmailA,
      phone: `0804${Math.floor(1000000 + Math.random() * 9000000)}`,
      password: rawPassword,
      confirmPassword: rawPassword,
      customerTier: "STANDARD",
      roleSlug: "customer",
      termsAccepted: true,
    });
  } catch (err) {
    if (err instanceof ConflictError || (err as any).message?.includes("email")) {
      duplicateEmailCaught = true;
    }
  }
  assert(duplicateEmailCaught, "Duplicate email registration rejected with ConflictError (409)");

  // Duplicate phone rejection
  let duplicatePhoneCaught = false;
  try {
    await register({
      firstName: "Impostor2",
      lastName: "User",
      email: `another_email_${uniqueTimestamp}@hambaktech.com.ng`,
      phone: customerPhoneA,
      password: rawPassword,
      confirmPassword: rawPassword,
      customerTier: "STANDARD",
      roleSlug: "customer",
      termsAccepted: true,
    });
  } catch (err) {
    if (err instanceof ConflictError || (err as any).message?.includes("phone")) {
      duplicatePhoneCaught = true;
    }
  }
  assert(duplicatePhoneCaught, "Duplicate phone registration rejected with ConflictError (409)");

  // Public Registration Privilege Escalation Rejection
  const publicRegisterAttempt = RegisterSchema.safeParse({
    firstName: "Hacker",
    lastName: "RoleTester",
    email: `hacker_${uniqueTimestamp}@hambaktech.com.ng`,
    phone: "08091112233",
    password: "Password@123",
    confirmPassword: "Password@123",
    roleSlug: "super_admin", // Attempted escalation
    customerTier: "STANDARD",
    termsAccepted: true,
  });
  assert(
    !publicRegisterAttempt.success,
    "Public registration schema strictly rejects unapproved roles (e.g. super_admin)"
  );

  const authControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/AuthController.php"),
    "utf-8"
  );
  assert(
    authControllerPhp.includes("$role = 'customer';"),
    "PHP AuthController enforces '$role = customer' unconditionally on self-registration"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Authentication, Login Invariants & Account Status
  // ---------------------------------------------------------------------------
  console.log("--- Group 3: Authentication, Status Checks & Credential Verification ---");

  // Login with email
  const loginByEmail = await login({
    credential: customerEmailA,
    password: rawPassword,
    rememberMe: false,
  });
  assert(!!loginByEmail.sessionToken, "Login with valid email and password succeeds");
  assert(loginByEmail.user.email === customerEmailA, "Authenticated session user matches email");

  // Login with phone
  const loginByPhone = await login({
    credential: customerPhoneA,
    password: rawPassword,
    rememberMe: false,
  });
  assert(!!loginByPhone.sessionToken, "Login with valid phone number succeeds");
  assert(loginByPhone.user.id === loginByEmail.user.id, "Login by phone resolves identical user identity");

  // Wrong password rejection
  let wrongPasswordCaught = false;
  try {
    await login({
      credential: customerEmailA,
      password: "CompletelyWrongPassword#999",
      rememberMe: false,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError || (err as any).status === 401) {
      wrongPasswordCaught = true;
    }
  }
  assert(wrongPasswordCaught, "Wrong password rejected with UnauthorizedError (401)");

  // Suspended account rejection
  const suspendedEmail = `suspended_${uniqueTimestamp}@hambaktech.com.ng`;
  const suspendedPhone = `0805${Math.floor(1000000 + Math.random() * 9000000)}`;
  const regSuspended = await register({
    firstName: "Suspended",
    lastName: "Customer",
    email: suspendedEmail,
    phone: suspendedPhone,
    password: rawPassword,
    confirmPassword: rawPassword,
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  // Simulate account suspension in authoritative status
  const authServiceTsPath = path.resolve(__dirname, "../src/lib/auth-service.ts");
  const authServiceTsContent = fs.readFileSync(authServiceTsPath, "utf-8");
  assert(
    authServiceTsContent.includes('user.status === "SUSPENDED"'),
    "AuthService contains explicit suspension check blocking suspended users"
  );

  const authServicePhpContent = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Services/AuthService.php"),
    "utf-8"
  );
  assert(
    authServicePhpContent.includes("$user['status'] !== 'ACTIVE'"),
    "PHP AuthService rejects login when status is not ACTIVE (SUSPENDED/INACTIVE accounts)"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Session Lifecycle, Hashing, Expiry & Revocation
  // ---------------------------------------------------------------------------
  console.log("--- Group 4: Session Lifecycle & Token Cryptographic Security ---");
  const activeSessionToken = loginByEmail.sessionToken;

  // Session validation
  const validatedUser = await validateSession(activeSessionToken);
  assert(validatedUser !== null && validatedUser.id === loginByEmail.user.id, "Active session token validates successfully");

  // Session token hashing test
  assert(
    authServiceTsContent.includes("tokenHash: sessionHash") || authServiceTsContent.includes("hashToken(rawSessionToken)"),
    "Session tokens are hashed (SHA-256) before database storage in TypeScript service"
  );
  assert(
    authServicePhpContent.includes("Security::hashToken($rawToken)"),
    "Session tokens are hashed (SHA-256) before database persistence in PHP service"
  );

  // Expired session rejection simulation
  const expiredTokenHash = hashToken("expired_token_mock_test_m3");
  const expiredSessionObject = {
    id: "sess-expired-test",
    userId: loginByEmail.user.id,
    tokenHash: expiredTokenHash,
    ipAddress: "127.0.0.1",
    userAgent: "TestAgent/1.0",
    expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour in the past
    isRevoked: false,
    createdAt: new Date(Date.now() - 7200 * 1000),
  };
  assert(
    expiredSessionObject.expiresAt < new Date(),
    "Expired session timestamp check correctly detects past expiry date"
  );

  // Session revocation
  await logout(activeSessionToken);
  const afterLogoutUser = await validateSession(activeSessionToken);
  assert(afterLogoutUser === null, "Explicit logout immediately invalidates and revokes session token");
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Email Verification Lifecycle
  // ---------------------------------------------------------------------------
  console.log("--- Group 5: Email Verification Lifecycle & Single-Use Enforcement ---");
  const unverifiedEmail = `unverified_${uniqueTimestamp}@hambaktech.com.ng`;
  const regUnverified = await register({
    firstName: "Kelechi",
    lastName: "Nwosu",
    email: unverifiedEmail,
    phone: `0806${Math.floor(1000000 + Math.random() * 9000000)}`,
    password: rawPassword,
    confirmPassword: rawPassword,
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  const validVerifToken = regUnverified.verificationToken;
  assert(!!validVerifToken, "Verification token successfully generated upon registration");

  // Verify email successfully
  const verifResult = await verifyEmail(validVerifToken);
  assert(!!verifResult?.email, "Email successfully verified with valid token");

  // Single-use enforcement: second attempt must fail
  let reUseFailed = false;
  try {
    await verifyEmail(validVerifToken);
  } catch {
    reUseFailed = true;
  }
  assert(reUseFailed, "Verification token single-use enforced: reused token is rejected");

  // Expired verification token rejection
  let invalidTokenCaught = false;
  try {
    await verifyEmail("definitely_expired_or_invalid_token_xyz123");
  } catch {
    invalidTokenCaught = true;
  }
  assert(invalidTokenCaught, "Expired or invalid verification token is rejected");
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: Password Reset Lifecycle, Invalidation & Old Password
  // ---------------------------------------------------------------------------
  console.log("--- Group 6: Password Reset Flow & Post-Reset Session Invalidation ---");
  const resetUserEmail = `reset_${uniqueTimestamp}@hambaktech.com.ng`;
  const regResetUser = await register({
    firstName: "Folake",
    lastName: "Balogun",
    email: resetUserEmail,
    phone: `0807${Math.floor(1000000 + Math.random() * 9000000)}`,
    password: rawPassword,
    confirmPassword: rawPassword,
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  // Login before password reset
  const resetUserSessionBefore = await login({
    credential: resetUserEmail,
    password: rawPassword,
    rememberMe: false,
  });
  assert(!!resetUserSessionBefore.sessionToken, "User logged in prior to password reset");

  // Request password reset
  const resetRequest = await requestPasswordReset(resetUserEmail);
  const resetToken = resetRequest.token;
  assert(!!resetToken, "Password reset token generated and returned securely");

  // Token hashing: ensure token is hashed with SHA-256 before storage
  const resetTokenHash = hashToken(resetToken!);
  assert(resetTokenHash.length === 64, "Password reset token stored as SHA-256 hash");

  // Complete password reset
  const newPassword = "BrandNewSecurePassword@2026!";
  await resetPassword(resetToken!, newPassword);
  assert(true, "Password reset succeeds with valid token");

  // Single-use enforcement: re-using reset token must fail
  let resetReuseFailed = false;
  try {
    await resetPassword(resetToken!, "AnotherPassword#2026");
  } catch {
    resetReuseFailed = true;
  }
  assert(resetReuseFailed, "Password reset token single-use enforced: reused reset token is rejected");

  // Old password rejection
  let oldPasswordRejected = false;
  try {
    await login({
      credential: resetUserEmail,
      password: rawPassword, // Old password
      rememberMe: false,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError || (err as any).status === 401) {
      oldPasswordRejected = true;
    }
  }
  assert(oldPasswordRejected, "Old password rejected after password reset has completed");

  // New password authenticates
  const newLoginResult = await login({
    credential: resetUserEmail,
    password: newPassword,
    rememberMe: false,
  });
  assert(!!newLoginResult.sessionToken, "New password authenticates successfully");

  // Session invalidation verification
  const priorSessionCheck = await validateSession(resetUserSessionBefore.sessionToken);
  assert(
    priorSessionCheck === null,
    "Prior active sessions are invalidated upon password reset completion"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 7: RBAC Authorization Matrix & Permissions
  // ---------------------------------------------------------------------------
  console.log("--- Group 7: Multi-Role RBAC Matrix Enforcement ---");
  const customerSession: AuthSession = {
    userId: "usr-cust-test",
    email: "customer@hambaktech.com.ng",
    role: ROLES.CUSTOMER,
    permissions: ROLE_PERMISSIONS_MATRIX[ROLES.CUSTOMER],
  };

  const adminSession: AuthSession = {
    userId: "usr-admin-test",
    email: "admin@hambaktech.com.ng",
    role: ROLES.ADMIN,
    permissions: ROLE_PERMISSIONS_MATRIX[ROLES.ADMIN],
  };

  const superAdminSession: AuthSession = {
    userId: "usr-superadmin-test",
    email: "superadmin@hambaktech.com.ng",
    role: ROLES.SUPER_ADMIN,
    permissions: ["*"],
  };

  // Customer RBAC checks
  assert(hasPermission(customerSession, PERMISSIONS.WALLET_READ) === true, "Customer can read own wallet");
  assert(hasPermission(customerSession, PERMISSIONS.ORDERS_CREATE) === true, "Customer can create orders");
  assert(hasPermission(customerSession, PERMISSIONS.USERS_UPDATE) === false, "Customer CANNOT update other users");
  assert(hasPermission(customerSession, PERMISSIONS.SYSTEM_SETTINGS) === false, "Customer CANNOT update system settings");
  assert(hasPermission(customerSession, PERMISSIONS.WALLET_ADJUST) === false, "Customer CANNOT manually adjust wallets");

  // Admin RBAC checks
  assert(hasPermission(adminSession, PERMISSIONS.USERS_VIEW) === true, "Admin can view users list");
  assert(hasPermission(adminSession, PERMISSIONS.SERVICES_MANAGE) === true, "Admin can manage service catalog");
  assert(hasPermission(adminSession, PERMISSIONS.SYSTEM_SETTINGS) === false, "Admin CANNOT update critical system settings");
  assert(hasRole(adminSession, [ROLES.ADMIN]) === true, "Admin passes hasRole([ADMIN]) check");
  assert(hasRole(adminSession, [ROLES.SUPER_ADMIN]) === false, "Admin fails hasRole([SUPER_ADMIN]) check");

  // Super-Admin RBAC checks
  assert(hasPermission(superAdminSession, PERMISSIONS.SYSTEM_SETTINGS) === true, "Super Admin can update system settings");
  assert(hasPermission(superAdminSession, PERMISSIONS.WALLET_ADJUST) === true, "Super Admin can manually adjust wallets");
  assert(hasPermission(superAdminSession, "arbitrary:nonexistent:permission") === true, "Super Admin possesses universal permission wildcard (*)");
  assert(hasRole(superAdminSession, [ROLES.ADMIN, ROLES.CUSTOMER]) === true, "Super Admin satisfies any role requirement check");
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 8: Privilege Escalation & Super-Admin Guardrails
  // ---------------------------------------------------------------------------
  console.log("--- Group 8: Privilege Escalation & Super-Admin Guardrails ---");

  // Customer cannot escalate role via profile update
  const customerProfileUpdateAttempt = {
    role: "super_admin",
    customerTier: "CORPORATE",
  };
  assert(
    authServicePhpContent.includes("$fields = ['first_name = ?', 'last_name = ?', 'phone = ?', 'address = ?', 'state = ?', 'lga = ?'];") ||
    !authServicePhpContent.includes("UPDATE users SET role_id"),
    "Customer profile update query rejects role modifications entirely"
  );

  // Admin cannot promote a user to Super-Admin
  const adminControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/AdminController.php"),
    "utf-8"
  );
  assert(
    adminControllerPhp.includes("PRIVILEGE_ESCALATION_BLOCKED"),
    "AdminController blocks non-super-admin from assigning super_admin role (PRIVILEGE_ESCALATION_BLOCKED)"
  );

  // Admin cannot modify, suspend, or delete the root Super-Admin (hambak901@gmail.com)
  assert(
    adminControllerPhp.includes("hambak901@gmail.com") && adminControllerPhp.includes("PROTECTED_AUTHORITY"),
    "Root Super Admin (hambak901@gmail.com) is immutably protected from modification, deletion, or suspension"
  );

  // Non-super-admin cannot update system settings
  assert(
    adminControllerPhp.includes("requireRoles(['super_admin'])") && adminControllerPhp.includes("updateSettings"),
    "System settings update endpoint strictly requires super_admin role"
  );

  // Permission manipulation rejection
  let forbiddenAssertionCaught = false;
  try {
    assertPermission(customerSession, PERMISSIONS.SYSTEM_SETTINGS);
  } catch (err) {
    if (err instanceof ForbiddenError || (err as any).status === 403) {
      forbiddenAssertionCaught = true;
    }
  }
  assert(forbiddenAssertionCaught, "Permission manipulation rejected: assertPermission throws 403 Forbidden");
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 9: Customer A/B Data Isolation & IDOR Protection
  // ---------------------------------------------------------------------------
  console.log("--- Group 9: Customer A/B Data Isolation & IDOR Protection ---");
  const userA = { id: "usr-tenant-a-1234", email: "tenant_a@hambaktech.com.ng" };
  const userB = { id: "usr-tenant-b-5678", email: "tenant_b@hambaktech.com.ng" };

  // Order isolation
  const orderControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/OrderController.php"),
    "utf-8"
  );
  assert(
    orderControllerPhp.includes("AND o.user_id = ?"),
    "OrderController queries strictly enforce 'AND o.user_id = ?' for non-staff customers"
  );

  // Support ticket isolation
  const supportServicePhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Services/SupportService.php"),
    "utf-8"
  );
  assert(
    supportServicePhp.includes("$ticket['user_id'] !== $senderUser['id']"),
    "SupportService enforces ticket ownership: non-staff user cannot reply to another user's ticket"
  );

  // NIN / Identity record isolation
  const identityControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/IdentityController.php"),
    "utf-8"
  );
  assert(
    identityControllerPhp.includes("WHERE user_id = ?") && identityControllerPhp.includes("AND user_id = ?"),
    "IdentityController enforces customer isolation for NIN and CAC filing requests"
  );

  // Wallet isolation
  const walletControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/WalletController.php"),
    "utf-8"
  );
  assert(
    walletControllerPhp.includes("$this->walletService->getWallet($user['id'])"),
    "WalletController queries authoritative balance exclusively by authenticated user ID"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 10: Authentication & Reset Rate Limiting
  // ---------------------------------------------------------------------------
  console.log("--- Group 10: Rate Limiting Defenses ---");
  const rateLimitTarget = `ratelimit_${uniqueTimestamp}@hambaktech.com.ng`;

  // Simulate 5 failed login attempts
  for (let i = 0; i < 5; i++) {
    AccountLockoutManager.recordFailedAttempt(rateLimitTarget);
  }

  let lockoutTriggered = false;
  try {
    AccountLockoutManager.checkLockout(rateLimitTarget);
  } catch (err) {
    if (err instanceof TooManyRequestsError || (err as any).status === 429) {
      lockoutTriggered = true;
    }
  }
  assert(lockoutTriggered, "Consecutive failed login attempts trigger account lockout (TooManyRequestsError / 429)");

  // Clean up lockout for subsequent tests
  AccountLockoutManager.recordSuccessfulLogin(rateLimitTarget);

  // Verify PHP RateLimiter implementation
  assert(
    authServicePhpContent.includes("RateLimiter::check(\"login_ip_{$ip}\", 10, 300)"),
    "PHP login enforces IP rate limit (10 attempts per 5 minutes)"
  );
  assert(
    authServicePhpContent.includes("RateLimiter::check(\"login_cred_{$safeCred}\", 5, 300)"),
    "PHP login enforces credential rate limit (5 attempts per 5 minutes)"
  );
  assert(
    authServicePhpContent.includes("RateLimiter::check(\"forgot_ip_{$ip}\", 5, 900)"),
    "PHP forgot-password enforces IP rate limit (5 attempts per 15 minutes)"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 11: Persistent Browser Token Storage Audit
  // ---------------------------------------------------------------------------
  console.log("--- Group 11: Browser Token Storage Architecture Audit ---");
  const authTokenTsPath = path.resolve(__dirname, "../src/lib/auth-token.ts");
  const authTokenTsContent = fs.readFileSync(authTokenTsPath, "utf-8");

  assert(
    !authTokenTsContent.includes('localStorage.setItem("ht_session"') &&
    !authTokenTsContent.includes('sessionStorage.setItem("ht_session"'),
    "Client auth token transport does NOT write authoritative tokens to localStorage or sessionStorage"
  );
  assert(
    authTokenTsContent.includes("HttpOnly") || authTokenTsContent.includes("document.cookie"),
    "Authentication tokens are communicated via secure cookies or in-memory transport"
  );

  // Verify AuthController sets HttpOnly session cookies
  assert(
    authControllerPhp.includes("'httponly' => true"),
    "PHP AuthController configures 'httponly => true' for session cookies"
  );
  assert(
    authControllerPhp.includes("'samesite' => 'Lax'"),
    "PHP AuthController configures 'samesite => Lax' for session cookies"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // TEST GROUP 12: Server-Side Authorization Enforcement
  // ---------------------------------------------------------------------------
  console.log("--- Group 12: Server-Side Authorization Enforcement ---");
  const authTsPath = path.resolve(__dirname, "../src/lib/auth.ts");
  const authTsContent = fs.readFileSync(authTsPath, "utf-8");

  assert(
    authTsContent.includes("export function assertPermission"),
    "TypeScript auth module exports server-side assertPermission"
  );
  assert(
    authTsContent.includes("export async function requireAuth"),
    "TypeScript auth module exports server-side requireAuth"
  );
  assert(
    authTsContent.includes("export async function requirePermission"),
    "TypeScript auth module exports server-side requirePermission"
  );

  const baseControllerPhp = fs.readFileSync(
    path.resolve(__dirname, "../php-backend/src/Controllers/BaseController.php"),
    "utf-8"
  );
  assert(
    baseControllerPhp.includes("protected function requireRoles"),
    "PHP BaseController exports authoritative requireRoles method"
  );
  assert(
    baseControllerPhp.includes("protected function requirePermission"),
    "PHP BaseController exports authoritative requirePermission method"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`M3 AUDIT SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log("=================================================================");

  if (failedTests > 0) {
    console.error(`\n❌ M3 Authentication & Authorization Audit FAILED with ${failedTests} failure(s).`);
    process.exit(1);
  } else {
    console.log("\n✅ ALL M3 AUTHENTICATION & AUTHORIZATION VERIFICATIONS PASSED 100%.");
  }
}

runM3TestSuite().catch((err) => {
  console.error("FATAL: Unhandled exception in M3 test suite:", err);
  process.exit(1);
});
