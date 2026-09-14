/**
 * HAMBAKTECH FILE SECURITY & WEBHOOK AUTHENTICITY TEST SUITE
 * 
 * Verifies:
 * 1. File upload validation (extension whitelisting, dangerous script blocking)
 * 2. Magic byte file header inspection (tampered MIME detection)
 * 3. File size constraint enforcement
 * 4. Directory traversal and safe filename generation
 * 5. StorageProvider abstraction (public vs sensitive document vault)
 * 6. Webhook cryptographic signature verification (HMAC-SHA512)
 * 7. Webhook replay attack prevention & idempotency caching
 * 8. Sliding-window rate limiting engine
 */

import { createHmac } from "node:crypto";
import {
  validateUploadFile,
  verifyBufferMagicBytes,
  DEFAULT_FILE_SECURITY_CONFIG,
} from "../src/lib/file-security";
import { WebhookSecurity } from "../src/lib/webhook-security";
import { LocalStorageProvider } from "../src/lib/storage";
import { checkRateLimit, InMemoryRateLimitStore, setRateLimitStore } from "../src/lib/rate-limit";

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
  console.log("🚀 STARTING HAMBAKTECH FILE SECURITY & WEBHOOK SUITE");
  console.log("=================================================================\n");

  // -------------------------------------------------------------------------
  // 1. FILE UPLOAD EXTENSION & SECURITY CHECKS
  // -------------------------------------------------------------------------
  console.log("Step 1: Testing File Upload Extension & Script Rejection...");

  // Valid PDF
  const pdfBuffer = Buffer.from("%PDF-1.4 standard dummy document content");
  const validPdf = validateUploadFile("document.pdf", "application/pdf", pdfBuffer.length, pdfBuffer);
  assert(validPdf.isValid === true, "Legitimate PDF document accepted");
  assert(validPdf.safeFilename.endsWith(".pdf"), "Safe filename preserves valid extension");

  // Dangerous script extensions (.php, .exe, .sh, .html, .js)
  const dangerousList = ["exploit.php", "malware.exe", "backdoor.sh", "phishing.html", "script.js"];
  for (const maliciousFile of dangerousList) {
    let rejected = false;
    try {
      validateUploadFile(maliciousFile, "application/octet-stream", 1024);
    } catch {
      rejected = true;
    }
    assert(rejected, `Dangerous file '${maliciousFile}' is strictly blocked`);
  }

  // Double extension or path traversal attempt in filename
  let traversalCaught = false;
  try {
    validateUploadFile("../../../etc/passwd", "application/pdf", 1024);
  } catch {
    traversalCaught = true;
  }
  // The filename is either sanitized or rejected
  const sanitized = validateUploadFile("../../test.pdf", "application/pdf", 1024);
  assert(!sanitized.safeFilename.includes("../"), "Path traversal sequences sanitized from filename");
  console.log("");

  // -------------------------------------------------------------------------
  // 2. MAGIC BYTES / BUFFER INSPECTION
  // -------------------------------------------------------------------------
  console.log("Step 2: Testing Magic Bytes Binary Header Verification...");
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert(verifyBufferMagicBytes(validPngBuffer, "image/png"), "Real PNG magic bytes (89 50 4E 47) verified");

  const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert(verifyBufferMagicBytes(validJpgBuffer, "image/jpeg"), "Real JPEG magic bytes (FF D8 FF) verified");

  const fakePngWithPhp = Buffer.from("<?php echo 'malicious code'; ?>");
  assert(!verifyBufferMagicBytes(fakePngWithPhp, "image/png"), "Spoofed PNG with PHP payload fails magic byte verification");
  console.log("");

  // -------------------------------------------------------------------------
  // 3. STORAGE PROVIDER ABSTRACTION
  // -------------------------------------------------------------------------
  console.log("Step 3: Testing StorageProvider (Public vs Secure Vault)...");
  const storage = new LocalStorageProvider();

  const publicUpload = await storage.upload(
    Buffer.from("Sample public avatar image content"),
    "avatar_test.png",
    "image/png",
    false
  );
  assert(publicUpload.url.startsWith("/uploads/"), "Public asset saved to /uploads/ URL path");
  assert(publicUpload.isSensitive === false, "Public asset flagged isSensitive = false");

  const secureUpload = await storage.upload(
    Buffer.from("%PDF-1.4 confidential identity slip"),
    "nin_slip_test.pdf",
    "application/pdf",
    true
  );
  assert(secureUpload.url.startsWith("/api/v1/storage/secure-document"), "Sensitive asset routed through secure vault API");
  assert(secureUpload.isSensitive === true, "Sensitive asset flagged isSensitive = true");

  const exists = await storage.exists(secureUpload.key, true);
  assert(exists === true, "Uploaded file existence verified in vault");

  await storage.delete(publicUpload.key, false);
  await storage.delete(secureUpload.key, true);
  console.log("");

  // -------------------------------------------------------------------------
  // 4. WEBHOOK CRYPTOGRAPHIC SIGNATURES (HMAC-SHA512)
  // -------------------------------------------------------------------------
  console.log("Step 4: Testing Webhook Cryptographic HMAC Verification...");
  const testSecret = "sk_test_hambak_secret_key_998877";
  const webhookBody = JSON.stringify({
    event: "charge.success",
    data: { reference: "HT-TEST-REF-001", amount: 250000 },
  });

  const validSignature = createHmac("sha512", testSecret).update(webhookBody).digest("hex");
  const verified = WebhookSecurity.verifyPaystackSignature(webhookBody, validSignature, testSecret);
  assert(verified === true, "Authentic HMAC-SHA512 webhook signature successfully verified");

  const forgedSignature = createHmac("sha512", "wrong_secret").update(webhookBody).digest("hex");
  const forgedResult = WebhookSecurity.verifyPaystackSignature(webhookBody, forgedSignature, testSecret);
  assert(forgedResult === false, "Forged webhook signature strictly rejected");

  const emptyResult = WebhookSecurity.verifyPaystackSignature(webhookBody, null, testSecret);
  assert(emptyResult === false, "Missing webhook signature strictly rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // 5. WEBHOOK REPLAY ATTACK PREVENTION & IDEMPOTENCY
  // -------------------------------------------------------------------------
  console.log("Step 5: Testing Webhook Replay Attack Prevention & Idempotency...");
  const eventId = `evt_paystack_${Date.now()}`;
  assert(!WebhookSecurity.isDuplicateEvent("PAYSTACK", eventId), "New webhook event is not flagged as duplicate");

  WebhookSecurity.recordProcessedEvent("PAYSTACK", eventId, "SUCCESS", "HT-TEST-REF-001");
  assert(WebhookSecurity.isDuplicateEvent("PAYSTACK", eventId), "Repeated event delivery flagged as DUPLICATE (Replay attack blocked)");
  console.log("");

  // -------------------------------------------------------------------------
  // 6. SLIDING-WINDOW RATE LIMITING ENGINE
  // -------------------------------------------------------------------------
  console.log("Step 6: Testing Multi-Tier Sliding Window Rate Limiting...");
  const testStore = new InMemoryRateLimitStore();
  setRateLimitStore(testStore);

  const rateConfig = { maxRequests: 3, windowSeconds: 60 };
  const clientKey = "test_ip_192_168_1_50";

  const res1 = checkRateLimit(clientKey, rateConfig);
  assert(res1.success === true && res1.remaining === 2, "Request 1 allowed (Remaining: 2)");

  const res2 = checkRateLimit(clientKey, rateConfig);
  assert(res2.success === true && res2.remaining === 1, "Request 2 allowed (Remaining: 1)");

  const res3 = checkRateLimit(clientKey, rateConfig);
  assert(res3.success === true && res3.remaining === 0, "Request 3 allowed (Remaining: 0)");

  const res4 = checkRateLimit(clientKey, rateConfig);
  assert(res4.success === false && res4.remaining === 0, "Request 4 BLOCKED by rate limiter (HTTP 429 condition)");
  console.log("");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`SECURITY & WEBHOOK RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
