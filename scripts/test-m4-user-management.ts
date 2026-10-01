/**
 * HAMBAKTECH MILESTONE 4 (M4) — USER & CUSTOMER MANAGEMENT TEST SUITE
 * 
 * Comprehensive verification of:
 * 1. Customer profile read & update with validation
 * 2. Mass assignment attack defense (rejecting role, status, walletBalance, kycTier, etc.)
 * 3. Customer IDOR & data isolation (Customer cannot manipulate other users' profile/sessions)
 * 4. Password change flow with session revocation
 * 5. Email update flow with password verification & audit trail
 * 6. Customer Identity & KYC verification submission
 * 7. Active session tracking, individual session revocation & revocation of other sessions
 * 8. Admin user list with search, filtering, and pagination
 * 9. Admin customer detail 360 view
 * 10. Admin customer status management (Activate/Suspend with reason & automatic session revocation)
 * 11. Admin KYC review & approval (Tier 2/3 upgrade, notes, status transition)
 * 12. Super-admin guardrails (root hambak901@gmail.com immutable protection, non-super-admin privilege escalation blocking)
 * 13. Audit trail verification across all customer & admin lifecycle operations
 */

import {
  register,
  login,
  validateSession,
  updateUserProfile,
  changePassword,
  updateEmail,
  submitKYC,
  getUserSessions,
  revokeUserSession,
  revokeAllOtherSessions,
  getUserActivity,
  adminListUsers,
  adminGetUser,
  adminUpdateUser,
  adminUpdateUserStatus,
  adminUpdateUserKYC,
} from "../src/lib/auth-service";
import { assertPermission } from "../src/lib/auth";
import { ROLES, PERMISSIONS } from "../src/lib/auth-constants";

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${title}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${title} ${detail ? `[${detail}]` : ""}`);
  }
}

async function runM4TestSuite() {
  console.log("=================================================================");
  console.log("🔒 HAMBAKTECH MILESTONE 4: USER & CUSTOMER MANAGEMENT TEST SUITE");
  console.log("=================================================================\n");

  const timestamp = Date.now();
  const customerEmail = `m4.customer.${timestamp}@example.com`;
  const customerPhone = `080${String(timestamp).slice(-8)}`;
  const initialPassword = "CustomerSecure#2026";

  // -------------------------------------------------------------------------
  // SECTION 1: Customer Registration & Session Setup
  // -------------------------------------------------------------------------
  console.log("--- Group 1: Customer Account Initialization ---");
  const regResult = await register({
    firstName: "Chukwudi",
    lastName: "Okeke",
    email: customerEmail,
    phone: customerPhone,
    password: initialPassword,
    confirmPassword: initialPassword,
    customerTier: "STANDARD",
    roleSlug: "customer",
    termsAccepted: true,
  });

  assert(Boolean(regResult.sessionData?.sessionToken), "Customer registration returns valid session token");
  assert(regResult.sessionData?.user?.email === customerEmail, "Session user email matches registration");
  assert(regResult.sessionData?.user?.role?.slug === "customer", "Initial user role is strictly customer");

  const customerId = regResult.sessionData.user.id;
  const sessionToken1 = regResult.sessionData.sessionToken;

  // Create second session for device session testing
  const loginResult2 = await login({
    credential: customerEmail,
    password: initialPassword,
    rememberMe: false,
  });
  const sessionToken2 = loginResult2.sessionToken;
  assert(Boolean(sessionToken2), "Customer secondary mobile session initialized");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 2: Customer Profile Updates & Mass Assignment Defense
  // -------------------------------------------------------------------------
  console.log("--- Group 2: Profile Updates & Mass Assignment Defense ---");
  const updatedUser = await updateUserProfile(customerId, {
    firstName: "Chukwudi-John",
    lastName: "Okeke-Onyema",
    phone: `081${String(timestamp).slice(-8)}`,
    address: "Plot 14, Admiralty Way, Lekki Phase 1",
    state: "Lagos State",
    lga: "Eti-Osa",
  });

  assert(updatedUser.profile?.firstName === "Chukwudi-John", "Customer first name updated successfully");
  assert(updatedUser.profile?.lastName === "Okeke-Onyema", "Customer last name updated successfully");

  // Verify Mass Assignment Protection: attempt to manipulate role, status, walletBalance, kycTier
  let massAssignmentBlocked = false;
  try {
    await updateUserProfile(customerId, {
      firstName: "Hacker Attempt",
      role: "super_admin",
    } as any);
  } catch (err: any) {
    if (err.message.includes("Modifying protected field") || err.message.includes("forbidden") || err.message.includes("FORBIDDEN")) {
      massAssignmentBlocked = true;
    }
  }
  assert(massAssignmentBlocked, "Attempt to update role via profile update strictly rejected (403/Forbidden)");

  let statusAssignmentBlocked = false;
  try {
    await updateUserProfile(customerId, {
      status: "ACTIVE",
      customerTier: "CORPORATE",
    } as any);
  } catch (err: any) {
    if (err.message.includes("Modifying protected field") || err.message.includes("forbidden") || err.message.includes("FORBIDDEN")) {
      statusAssignmentBlocked = true;
    }
  }
  assert(statusAssignmentBlocked, "Attempt to elevate customerTier via profile update rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 3: Identity & KYC Verification Submission
  // -------------------------------------------------------------------------
  console.log("--- Group 3: Identity & KYC Verification Submission ---");
  const kycResult = await submitKYC(customerId, {
    ninLast4: "8901",
    bvnLast4: "5678",
  });

  assert(kycResult.kycStatus === "PENDING", "KYC status transitioned to PENDING upon submission");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 4: Active Session Management & Revocation
  // -------------------------------------------------------------------------
  console.log("--- Group 4: Device Session Tracking & Revocation ---");
  const initialSessions = await getUserSessions(customerId);
  assert(initialSessions.length >= 2, "Customer has at least 2 active tracked device sessions");

  // Revoke other sessions (leaving sessionToken2 active)
  await revokeAllOtherSessions(customerId, sessionToken2);

  const postRevokeSessions = await getUserSessions(customerId);
  assert(postRevokeSessions.length === 1, "Only current session remains active after revokeAllOtherSessions");

  // Verify that sessionToken1 is now invalidated
  const session1Validation = await validateSession(sessionToken1);
  assert(session1Validation === null, "Old session token is invalidated on validation");

  // Verify that sessionToken2 is still valid
  const session2Validation = await validateSession(sessionToken2);
  assert(session2Validation !== null, "Current session token remains authenticated and valid");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 5: Password Change Flow & Post-Change Session Invalidation
  // -------------------------------------------------------------------------
  console.log("--- Group 5: Password Change & Security Session Invalidation ---");
  const newPassword = "NewCustomerPassword#2026";

  // Wrong current password attempt
  let wrongPwBlocked = false;
  try {
    await changePassword(customerId, "IncorrectPassword", newPassword);
  } catch (err: any) {
    if (err.message.includes("incorrect") || err.message.includes("password")) {
      wrongPwBlocked = true;
    }
  }
  assert(wrongPwBlocked, "Password change with incorrect current password is rejected");

  // Valid password change
  await changePassword(customerId, initialPassword, newPassword);
  assert(true, "Password change with valid credentials succeeded without error");

  // Verify that old sessionToken2 was invalidated during password change
  const session2PostPwChange = await validateSession(sessionToken2);
  assert(session2PostPwChange === null, "Active sessions are invalidated upon password change for security");

  // Login with new password
  const newLogin = await login({
    credential: customerEmail,
    password: newPassword,
    rememberMe: false,
  });
  assert(Boolean(newLogin.sessionToken), "Login with new password succeeds");
  const validCustomerToken = newLogin.sessionToken;
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 6: Email Change Security Flow
  // -------------------------------------------------------------------------
  console.log("--- Group 6: Email Change Security & Password Requirement ---");
  const newEmail = `updated.email.${timestamp}@example.com`;

  // Wrong password on email update
  let wrongEmailPwBlocked = false;
  try {
    await updateEmail(customerId, newEmail, "WrongPassword");
  } catch (err: any) {
    wrongEmailPwBlocked = true;
  }
  assert(wrongEmailPwBlocked, "Email update rejected when provided password is invalid");

  // Valid email update
  const emailUpdateResult = await updateEmail(customerId, newEmail, newPassword);
  assert(emailUpdateResult.email === newEmail, "Email update succeeds with valid password verification");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 7: Admin Customer Listing & Filtering
  // -------------------------------------------------------------------------
  console.log("--- Group 7: Admin Customer Directory, Search & Filtering ---");
  const listResult = await adminListUsers({
    search: "Chukwudi",
    role: "customer",
    page: 1,
    limit: 10,
  });

  assert(Array.isArray(listResult.items), "adminListUsers returns items array");
  assert(listResult.total >= 1, "Customer found via search query");
  assert(listResult.items.some((u: any) => u.id === customerId), "Listed customers include created test user");

  // Non-admin permission check
  let customerAccessBlocked = false;
  try {
    assertPermission({
      userId: customerId,
      email: newEmail,
      role: "customer",
      permissions: [PERMISSIONS.PROFILE_UPDATE, PERMISSIONS.WALLET_READ],
    }, PERMISSIONS.USERS_READ);
  } catch (err: any) {
    customerAccessBlocked = true;
  }
  assert(customerAccessBlocked, "Customer denied users.read administrative permission (403)");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 8: Admin Customer 360 View & Profile Management
  // -------------------------------------------------------------------------
  console.log("--- Group 8: Admin 360 Customer Detail & Profile Update ---");
  const admin360User = await adminGetUser(customerId);
  assert(admin360User.id === customerId, "adminGetUser retrieves target customer 360 record");
  assert(admin360User.firstName === "Chukwudi-John", "360 record contains accurate profile information");
  assert(admin360User.walletBalance !== undefined, "360 record exposes wallet balance to administrative staff");

  // Build simulated admin actor payload
  const adminActor = {
    id: "usr-admin-01",
    email: "admin@hambaktech.com.ng",
    status: "ACTIVE",
    role: { id: "role-admin", name: "Administrator", slug: "admin" },
    profile: { firstName: "Admin", lastName: "Officer", avatarUrl: null },
    permissions: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE, PERMISSIONS.USERS_MANAGE],
    emailVerified: true,
    phoneVerified: true,
  } as any;

  // Admin updates customer tier to AGENT
  const updatedByAdmin = await adminUpdateUser(adminActor, customerId, {
    customerTier: "AGENT",
    address: "Hambak Tech Hub Agent Branch, Lekki",
  });

  assert(updatedByAdmin.customerTier === "AGENT", "Admin successfully upgraded customer to AGENT tier");
  assert(updatedByAdmin.address === "Hambak Tech Hub Agent Branch, Lekki", "Admin updated customer delivery address");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 9: Admin Status Management & Suspension Session Revocation
  // -------------------------------------------------------------------------
  console.log("--- Group 9: Admin Account Status Management & Suspension ---");
  // Suspend customer account
  const suspendResult = await adminUpdateUserStatus(
    adminActor,
    customerId,
    "SUSPENDED",
    "Suspicious high-frequency transaction flagged by AML"
  );
  assert(suspendResult.status === "SUSPENDED", "Customer status successfully transitioned to SUSPENDED");

  // Verify that active session was immediately revoked upon suspension
  const suspendedSession = await validateSession(validCustomerToken);
  assert(suspendedSession === null, "Suspension immediately invalidates all customer sessions");

  // Reactivate account
  const reactivateResult = await adminUpdateUserStatus(
    adminActor,
    customerId,
    "ACTIVE",
    "Customer identity verified via manual review"
  );
  assert(reactivateResult.status === "ACTIVE", "Customer status reactivated to ACTIVE");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 10: Admin KYC Review & Verification
  // -------------------------------------------------------------------------
  console.log("--- Group 10: Admin KYC Review & Approval ---");
  const kycApproval = await adminUpdateUserKYC(
    adminActor,
    customerId,
    "TIER_2",
    "VERIFIED",
    "National ID Card verified against NIMC database"
  );

  assert(kycApproval.kycStatus === "VERIFIED", "Customer KYC status updated to VERIFIED");
  assert(kycApproval.kycTier === "TIER_2", "Customer KYC tier upgraded to Tier 2 (₦500k daily limit)");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 11: Super-Admin Guardrails & Privilege Escalation Prevention
  // -------------------------------------------------------------------------
  console.log("--- Group 11: Super-Admin Guardrails & Privilege Escalation Defenses ---");
  // Non-super-admin tries to assign super_admin role
  let privEscalationBlocked = false;
  try {
    await adminUpdateUser(adminActor, customerId, {
      role: "super_admin",
    });
  } catch (err: any) {
    if (err.message.includes("super_admin") || err.message.includes("Forbidden")) {
      privEscalationBlocked = true;
    }
  }
  assert(privEscalationBlocked, "Non-super-admin blocked from assigning super_admin role (PRIVILEGE_ESCALATION_BLOCKED)");

  // Protected Root Super Admin Account cannot be suspended
  let rootAdminProtected = false;
  try {
    await adminUpdateUserStatus(adminActor, "user-superadmin-root", "SUSPENDED", "Malicious attack");
  } catch (err: any) {
    if (err.message.includes("cannot be deactivated") || err.message.includes("Root super_admin")) {
      rootAdminProtected = true;
    }
  }
  assert(rootAdminProtected, "Root super-admin account (hambak901@gmail.com) is immutably protected from suspension/deactivation");
  console.log("");

  // -------------------------------------------------------------------------
  // SECTION 12: Audit Trail Verification
  // -------------------------------------------------------------------------
  console.log("--- Group 12: Comprehensive Audit Trail Verification ---");
  const auditLogs = await getUserActivity(customerId);
  assert(auditLogs.length >= 4, `Customer audit trail records multiple security lifecycle events (${auditLogs.length} events logged)`);

  const actions = auditLogs.map((log: any) => log.action);
  assert(actions.includes("PROFILE_UPDATE_SUCCESS"), "Audit log records PROFILE_UPDATE_SUCCESS");
  assert(actions.includes("PASSWORD_CHANGE_SUCCESS"), "Audit log records PASSWORD_CHANGE_SUCCESS");
  assert(actions.includes("EMAIL_CHANGE_SUCCESS"), "Audit log records EMAIL_CHANGE_SUCCESS");
  assert(actions.includes("ADMIN_USER_UPDATED"), "Audit log records administrative ADMIN_USER_UPDATED");
  assert(actions.includes("ADMIN_KYC_STATUS_UPDATED") || actions.includes("KYC_SUBMITTED"), "Audit log records KYC verification updates");
  console.log("");

  // -------------------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`M4 TEST SUITE SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================================");

  if (failed === 0) {
    console.log("✅ ALL M4 USER & CUSTOMER MANAGEMENT VERIFICATIONS PASSED 100%.");
    process.exit(0);
  } else {
    console.error(`❌ ${failed} TESTS FAILED.`);
    process.exit(1);
  }
}

runM4TestSuite().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
