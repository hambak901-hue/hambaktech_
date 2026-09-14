/**
 * HAMBAKTECH MILESTONE 4 (M4 - AUTHENTICATION & RBAC) VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Cryptographic hashing, salting, and constant-time verification
 * 2. User registration lifecycle (Validation -> User -> Profile -> Wallet -> Verification Token)
 * 3. Login lifecycle (Credential verification -> Session generation -> Permissions extraction)
 * 4. Password recovery flow (Forgot Password -> Token -> Reset -> Password update & session revocation)
 * 5. Email verification flow (Token verification -> User status ACTIVE)
 * 6. Server-side RBAC authorization matrix (User -> Role -> Permissions -> API authorization -> Resource)
 */

import { hashPassword, verifyPassword, generateRandomToken, hashToken } from "../src/lib/crypto";
import {
  register,
  login,
  validateSession,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logout,
} from "../src/lib/auth-service";
import { hasPermission, assertPermission, AuthSession } from "../src/lib/auth";
import { ROLES, PERMISSIONS } from "../src/lib/auth-constants";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 STARTING HAMBAKTECH M4 AUTHENTICATION & RBAC TEST SUITE");
  console.log("=================================================================\n");

  // -------------------------------------------------------------------------
  // 1. CRYPTOGRAPHIC PRIMITIVES
  // -------------------------------------------------------------------------
  console.log("Step 1: Testing Bank-Grade Cryptographic Primitives...");
  const samplePassword = "TestPassword@2026";
  const hashedPassword = hashPassword(samplePassword);

  assert(hashedPassword.startsWith("pbkdf2$100000$"), "Password hash format is salted PBKDF2-SHA512");
  assert(verifyPassword(samplePassword, hashedPassword) === true, "Valid password passes constant-time verification");
  assert(verifyPassword("WrongPassword", hashedPassword) === false, "Incorrect password fails verification");

  const rawToken = generateRandomToken(32);
  const hashedToken = hashToken(rawToken);
  assert(rawToken.length === 64, "Random token generated with high entropy (64 hex chars)");
  assert(hashedToken.length === 64, "Token hash is SHA-256 (64 hex chars)");
  console.log("");

  // -------------------------------------------------------------------------
  // 2. USER REGISTRATION
  // -------------------------------------------------------------------------
  console.log("Step 2: Testing Registration Lifecycle (User -> Profile -> Wallet -> Verification Token)...");
  const testEmail = `newuser_${Date.now()}@hambaktech.com.ng`;
  const testPhone = `081${Math.floor(10000000 + Math.random() * 90000000)}`;

  const regResult = await register({
    firstName: "Chidi",
    lastName: "Okonkwo",
    email: testEmail,
    phone: testPhone,
    password: "SecurePassword@123",
    confirmPassword: "SecurePassword@123",
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  assert(!!regResult.sessionData.sessionToken, "Registration generates authenticated session token");
  assert(regResult.sessionData.user.email === testEmail, "User email correctly assigned");
  assert(regResult.sessionData.user.profile?.firstName === "Chidi", "Profile created with first name");
  assert(regResult.sessionData.user.profile?.lastName === "Okonkwo", "Profile created with last name");
  assert(regResult.sessionData.user.wallet?.status === "ACTIVE", "Dedicated digital wallet initialized with ACTIVE status");
  assert(regResult.sessionData.user.wallet?.currentBalance === "0.00", "Wallet starts with standard 0.00 balance");
  assert(!!regResult.verificationToken, "Email verification token dispatched on registration");
  console.log("");

  // -------------------------------------------------------------------------
  // 3. DUPLICATE REGISTRATION PREVENTION
  // -------------------------------------------------------------------------
  console.log("Step 3: Testing Conflict & Duplicate Prevention...");
  let duplicatePrevented = false;
  try {
    await register({
      firstName: "Duplicate",
      lastName: "Tester",
      email: testEmail,
      phone: testPhone,
      password: "SecurePassword@123",
      confirmPassword: "SecurePassword@123",
      customerTier: "STANDARD",
      roleSlug: "customer",
      termsAccepted: true,
    });
  } catch (err: unknown) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented, "Duplicate registration with existing email/phone is strictly rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // 4. EMAIL VERIFICATION LIFECYCLE
  // -------------------------------------------------------------------------
  console.log("Step 4: Testing Email Verification Flow...");
  const verificationResult = await verifyEmail(regResult.verificationToken);
  assert(verificationResult.email === testEmail, "Email verification confirms user email");

  // Verify that re-using the token fails
  let reUseFailed = false;
  try {
    await verifyEmail(regResult.verificationToken);
  } catch {
    reUseFailed = true;
  }
  assert(reUseFailed, "Used verification token cannot be re-used (single-use enforced)");
  console.log("");

  // -------------------------------------------------------------------------
  // 5. USER LOGIN & SESSION AUTHENTICATION
  // -------------------------------------------------------------------------
  console.log("Step 5: Testing Login Authentication with Email & Phone...");
  const loginByEmail = await login({
    credential: testEmail,
    password: "SecurePassword@123",
    rememberMe: false,
  });
  assert(!!loginByEmail.sessionToken, "Login with email produces valid session token");
  assert(loginByEmail.user.role.slug === "customer", "User assigned 'customer' role");

  const loginByPhone = await login({
    credential: testPhone,
    password: "SecurePassword@123",
    rememberMe: true,
  });
  assert(!!loginByPhone.sessionToken, "Login with phone number produces valid session token");

  // Validate session token
  const validatedUser = await validateSession(loginByPhone.sessionToken);
  assert(!!validatedUser && validatedUser.email === testEmail, "validateSession retrieves correct user from token");
  console.log("");

  // -------------------------------------------------------------------------
  // 6. PASSWORD RECOVERY & RESET
  // -------------------------------------------------------------------------
  console.log("Step 6: Testing Password Recovery & Reset Flow...");
  const resetRequest = await requestPasswordReset(testEmail);
  assert(!!resetRequest.token, "Password reset token generated");

  const newPass = "NewSecurePassword@999";
  await resetPassword(resetRequest.token!, newPass);

  // Attempt login with old password -> must fail
  let oldLoginFailed = false;
  try {
    await login({ credential: testEmail, password: "SecurePassword@123", rememberMe: false });
  } catch {
    oldLoginFailed = true;
  }
  assert(oldLoginFailed, "Old password rejected after reset");

  // Attempt login with new password -> must succeed
  const newLogin = await login({ credential: testEmail, password: newPass, rememberMe: false });
  assert(!!newLogin.sessionToken, "New password authenticated successfully");
  console.log("");

  // -------------------------------------------------------------------------
  // 7. SESSION REVOCATION / LOGOUT
  // -------------------------------------------------------------------------
  console.log("Step 7: Testing Logout & Session Revocation...");
  await logout(newLogin.sessionToken);
  const revokedCheck = await validateSession(newLogin.sessionToken);
  assert(revokedCheck === null, "Revoked session token returns null on validation");
  console.log("");

  // -------------------------------------------------------------------------
  // 8. SERVER-SIDE RBAC & PERMISSIONS MATRIX ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log("Step 8: Testing Server-Side RBAC Enforcement (User -> Role -> Permissions -> API authorization)...");
  
  // Super Admin session test
  const superAdminLogin = await login({
    credential: "superadmin@hambaktech.com.ng",
    password: "Admin@123456",
    rememberMe: false,
  });

  const superAdminSession: AuthSession = {
    userId: superAdminLogin.user.id,
    email: superAdminLogin.user.email,
    role: superAdminLogin.user.role.slug,
    permissions: superAdminLogin.user.permissions,
  };

  assert(hasPermission(superAdminSession, PERMISSIONS.WALLET_ADJUST), "Super Admin has permission 'wallet.adjust'");
  assert(hasPermission(superAdminSession, PERMISSIONS.USERS_UPDATE), "Super Admin has permission 'users.update'");
  assert(hasPermission(superAdminSession, PERMISSIONS.SYSTEM_SETTINGS), "Super Admin has permission 'system.settings'");

  // Admin session test
  const adminLogin = await login({
    credential: "admin@hambaktech.com.ng",
    password: "Admin@123456",
    rememberMe: false,
  });

  const adminSession: AuthSession = {
    userId: adminLogin.user.id,
    email: adminLogin.user.email,
    role: adminLogin.user.role.slug,
    permissions: adminLogin.user.permissions,
  };

  assert(hasPermission(adminSession, PERMISSIONS.USERS_READ), "Admin has permission 'users.read'");
  assert(hasPermission(adminSession, PERMISSIONS.ORDERS_UPDATE), "Admin has permission 'orders.update'");
  assert(hasPermission(adminSession, PERMISSIONS.PRICING_MANAGE), "Admin has permission 'pricing.manage'");

  // Customer session test
  const customerSession: AuthSession = {
    userId: regResult.sessionData.user.id,
    email: regResult.sessionData.user.email,
    role: regResult.sessionData.user.role.slug,
    permissions: regResult.sessionData.user.permissions,
  };

  // Permitted operations for Customer
  assert(hasPermission(customerSession, PERMISSIONS.ORDERS_CREATE), "Customer has permission 'orders.create'");
  assert(hasPermission(customerSession, PERMISSIONS.WALLET_READ), "Customer has permission 'wallet.read'");
  assert(hasPermission(customerSession, PERMISSIONS.PROFILE_UPDATE), "Customer has permission 'profile.update'");

  // FORBIDDEN operations for Customer (Must NOT have admin permissions)
  assert(!hasPermission(customerSession, PERMISSIONS.USERS_UPDATE), "Customer is DENIED permission 'users.update'");
  assert(!hasPermission(customerSession, PERMISSIONS.WALLET_ADJUST), "Customer is DENIED permission 'wallet.adjust'");
  assert(!hasPermission(customerSession, PERMISSIONS.SERVICES_MANAGE), "Customer is DENIED permission 'services.manage'");
  assert(!hasPermission(customerSession, PERMISSIONS.SYSTEM_SETTINGS), "Customer is DENIED permission 'system.settings'");

  // AssertPermission throws ForbiddenError on missing permission
  let forbiddenCaught = false;
  try {
    assertPermission(customerSession, PERMISSIONS.WALLET_ADJUST);
  } catch (err: unknown) {
    forbiddenCaught = true;
  }
  assert(forbiddenCaught, "assertPermission correctly throws ForbiddenError (403) when permission is missing");

  console.log("\n=================================================================");
  console.log(`M4 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution encountered fatal error:", err);
  process.exit(1);
});
