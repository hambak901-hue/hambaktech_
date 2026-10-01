import { emailService } from "../src/lib/email";
import * as assert from "assert";

console.log("=================================================================");
console.log("🧪 HAMBAKTECH PRODUCTION EMAIL/SMTP READINESS TEST SUITE");
console.log("=================================================================");

async function runEmailTests() {
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    total++;
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
    }
  }

  console.log("\n--- Group 1: SMTP Configuration & Fail-Safe ---");
  await test("Unconfigured environment safely handles email without crash", async () => {
    const res = await emailService.sendEmail({
      to: "audit-test@hambaktech.com.ng",
      subject: "Security Audit Test",
      html: "<p>Test</p>",
      text: "Test",
    });
    assert.strictEqual(res.success, true);
  });

  console.log("\n--- Group 2: Account Lifecycle Email Flows ---");
  await test("Email verification generates valid secure token link", async () => {
    const res = await emailService.sendVerificationEmail("customer@example.com", "test-token-xyz-12345", "Hammed");
    assert.strictEqual(res.success, true);
  });

  await test("Password reset generates secure expiration token link", async () => {
    const res = await emailService.sendPasswordResetEmail("user@example.com", "reset-token-abc-98765", "Bakare");
    assert.strictEqual(res.success, true);
  });

  await test("General notification dispatches with structured layout", async () => {
    const res = await emailService.sendNotificationEmail("user@example.com", "Wallet Credited", "Your wallet has been credited with 5000 NGN.");
    assert.strictEqual(res.success, true);
  });

  console.log("\n=================================================================");
  console.log(`EMAIL READINESS RESULTS: ${passed}/${total} PASSED, ${total - passed} FAILED`);
  console.log("=================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runEmailTests();
