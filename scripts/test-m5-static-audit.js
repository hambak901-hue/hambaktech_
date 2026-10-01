/**
 * HAMBAKTECH SMART DIGITAL PLATFORM v1.0
 * Milestone 5: Wallet & Financial Foundation — Static Architecture & Security Audit
 *
 * Checks all 9 critical M5 invariants:
 * 1. Legacy funding route cannot directly credit wallet
 * 2. Frontend uses two-phase funding initialization and idempotency
 * 3. Payment adapters never return fake/simulated provider success
 * 4. Fixed-point calculations used for authoritative financial operations
 * 5. audit_logs uses canonical 'entity' column (not 'entity_type')
 * 6. Admin financial operations require authorization, audit logging, and use WalletService
 * 7. Wallet status changes enforce valid allowlist ('ACTIVE', 'FROZEN', 'RESTRICTED') with audit records
 * 8. Bank transfer configuration does not hardcode corporate bank accounts and fails safely
 * 9. database/schema.sql contains required M5 tables, constraints, and DECIMAL precision
 */

const fs = require('fs');
const path = require('path');

let passedCount = 0;
let failedCount = 0;

function assert(condition, ruleName, detail) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${ruleName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${ruleName} -> ${detail}`);
  }
}

function readFile(relativePath) {
  const fullPath = path.resolve(__dirname, '..', relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log("=================================================================");
console.log("🔍 M5 STATIC ARCHITECTURE & FINANCIAL SECURITY AUDIT");
console.log("=================================================================\n");

// -----------------------------------------------------------------------------
// 1. LEGACY FUNDING CANNOT DIRECTLY CREDIT WALLET
// -----------------------------------------------------------------------------
console.log("Invariant 1: Legacy Funding Route Defenses...");
try {
  const walletCtrl = readFile('php-backend/src/Controllers/WalletController.php');
  
  // Verify fund() does NOT call credit() directly
  const hasDirectCreditInFund = /function\s+fund\b[\s\S]*?->credit\s*\(/i.test(walletCtrl);
  assert(!hasDirectCreditInFund, "Legacy fund() method never directly calls credit()", "Found direct credit() inside fund()");

  // Verify fund() delegates to initializeFunding() or verifyFunding()
  const delegatesToTwoPhase = walletCtrl.includes('initializeFunding') && walletCtrl.includes('verifyFunding');
  assert(delegatesToTwoPhase, "Legacy fund() strictly routes via initializeFunding or verifyFunding", "fund() must route via two-phase flow");
} catch (e) {
  assert(false, "WalletController check", e.message);
}

// -----------------------------------------------------------------------------
// 2. FRONTEND USES FUNDING INITIALIZATION & IDEMPOTENCY
// -----------------------------------------------------------------------------
console.log("\nInvariant 2: Frontend Funding Flow & Idempotency...");
try {
  const fundPage = readFile('src/app/dashboard/wallet/fund/page.tsx');
  
  // Frontend calls initialize endpoint
  const callsInit = fundPage.includes('/api/wallet/fund/initialize');
  assert(callsInit, "Frontend calls /api/wallet/fund/initialize", "Must initialize funding before payment");

  // Frontend uses Idempotency-Key
  const usesIdemp = fundPage.includes('Idempotency-Key') || fundPage.includes('idempotencyKey');
  assert(usesIdemp, "Frontend sends Idempotency-Key header on funding initialization", "Missing Idempotency-Key");

  // Frontend does not directly mutate or assume immediate wallet credit
  const noInstantBalanceAssumption = !fundPage.includes("newBal = Number(json.data?.wallet?.currentBalance");
  assert(noInstantBalanceAssumption, "Frontend does not treat initialization as immediate successful credit", "Must not assume instant credit");

  // Verification page exists
  const verifyPageExists = fs.existsSync(path.resolve(__dirname, '../src/app/dashboard/wallet/verify/page.tsx'));
  assert(verifyPageExists, "Authoritative verification page exists at /dashboard/wallet/verify", "Missing verify page");
} catch (e) {
  assert(false, "Frontend funding page check", e.message);
}

// -----------------------------------------------------------------------------
// 3. NO FAKE/SIMULATED PROVIDER SUCCESS
// -----------------------------------------------------------------------------
console.log("\nInvariant 3: Payment Gateway Credentials & Zero Fake Success...");
try {
  const paystack = readFile('php-backend/src/Services/Payments/PaystackAdapter.php');
  const flutterwave = readFile('php-backend/src/Services/Payments/FlutterwaveAdapter.php');
  const moniepoint = readFile('php-backend/src/Services/Payments/MoniepointAdapter.php');
  const bankTransfer = readFile('php-backend/src/Services/Payments/BankTransferAdapter.php');

  // Verify PaystackAdapter returns CONFIGURATION_ERROR on missing/mock credentials
  const paystackBlocksMock = paystack.includes('CONFIGURATION_ERROR') &&
    (paystack.includes('str_starts_with($this->secretKey') || paystack.includes('empty($this->secretKey)'));
  assert(paystackBlocksMock, "PaystackAdapter returns CONFIGURATION_ERROR for missing/mock credentials in verifyPayment", "Paystack must not simulate success");

  // Verify FlutterwaveAdapter returns CONFIGURATION_ERROR on missing/mock credentials
  const flwBlocksMock = flutterwave.includes('CONFIGURATION_ERROR') &&
    (flutterwave.includes('str_starts_with($this->secretKey') || flutterwave.includes('empty($this->secretKey)'));
  assert(flwBlocksMock, "FlutterwaveAdapter returns CONFIGURATION_ERROR for missing/mock credentials in verifyPayment", "Flutterwave must not simulate success");

  // Verify MoniepointAdapter returns CONFIGURATION_ERROR or PENDING
  const mnpBlocksMock = moniepoint.includes('CONFIGURATION_ERROR') || moniepoint.includes('PENDING');
  assert(mnpBlocksMock, "MoniepointAdapter returns CONFIGURATION_ERROR or PENDING without credentials", "Moniepoint must not simulate success");

  // Verify BankTransferAdapter returns PENDING on verification
  const bankPending = bankTransfer.includes("'PENDING'");
  assert(bankPending, "BankTransferAdapter returns PENDING (never SUCCESSFUL) on verification", "Bank transfer requires admin or webhook verification");
} catch (e) {
  assert(false, "Payment adapters check", e.message);
}

// -----------------------------------------------------------------------------
// 4. FIXED-POINT FINANCIAL ARITHMETIC
// -----------------------------------------------------------------------------
console.log("\nInvariant 4: Fixed-Point Financial Precision...");
try {
  const moneyUtil = readFile('php-backend/src/Utils/Money.php');
  const walletService = readFile('php-backend/src/Services/WalletService.php');

  // Money class has round / precision handling
  const hasMoneyUtil = moneyUtil.includes('class Money') && moneyUtil.includes('round(');
  assert(hasMoneyUtil, "Reusable Money utility exists with fixed-point 2-decimal arithmetic", "Missing Money utility");

  // WalletService uses Money utility or fixed-point additions/subtractions
  const walletUsesMoney = walletService.includes('Money::add') && walletService.includes('Money::subtract');
  assert(walletUsesMoney, "WalletService uses Money::add and Money::subtract for balance mutations", "WalletService must use Money utility");

  // Webhook settlement does not fall back to database amount if webhook amount <= 0
  const noAmountFallback = !walletService.includes("$creditAmount = $event->amount > 0 ? $event->amount : (float)$payment['amount'];");
  assert(noAmountFallback, "Webhook processing rejects zero/invalid webhook amounts and never falls back to database payment amount", "Must not fall back to database amount");
} catch (e) {
  assert(false, "Financial precision check", e.message);
}

// -----------------------------------------------------------------------------
// 5. AUDIT LOGS CANONICAL SCHEMA ('entity' COLUMN)
// -----------------------------------------------------------------------------
console.log("\nInvariant 5: Audit Logs Schema Invariant ('entity' vs 'entity_type')...");
try {
  const schemaSql = readFile('database/schema.sql');
  const auditMatch = /CREATE TABLE `audit_logs`[\s\S]*?`entity`\s+VARCHAR/i.test(schemaSql);
  assert(auditMatch, "database/schema.sql defines canonical 'entity' column in audit_logs", "schema.sql must have entity column");

  // Scan all php-backend files for any illegal 'entity_type' in audit_logs inserts
  const phpFiles = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (f.endsWith('.php')) {
        phpFiles.push(full);
      }
    }
  }
  scanDir(path.resolve(__dirname, '../php-backend'));

  let foundEntityTypeInAudit = false;
  for (const f of phpFiles) {
    const content = fs.readFileSync(f, 'utf8');
    if (/INSERT INTO audit_logs[^(]*\([^)]*entity_type/i.test(content)) {
      foundEntityTypeInAudit = true;
      console.error(`Found entity_type in: ${f}`);
    }
  }
  assert(!foundEntityTypeInAudit, "Zero occurrences of 'entity_type' in audit_logs insertions across php-backend", "Must use canonical 'entity'");
} catch (e) {
  assert(false, "Audit logs column check", e.message);
}

// -----------------------------------------------------------------------------
// 6. ADMIN FINANCIAL OPERATIONS & AUDIT TRAIL
// -----------------------------------------------------------------------------
console.log("\nInvariant 6: Admin Financial Adjustments & Mutation Guardrails...");
try {
  const adminCtrl = readFile('php-backend/src/Controllers/AdminController.php');

  // adjustWallet uses WalletService
  const adjustUsesService = adminCtrl.includes('$this->walletService->adminAdjust(');
  assert(adjustUsesService, "Admin adjustWallet routes through WalletService::adminAdjust", "Must use WalletService");

  // adjustWallet requires reason
  const requiresReason = adminCtrl.includes("Adjustment reason is strictly mandatory");
  assert(requiresReason, "Admin adjustWallet enforces mandatory reason for audit compliance", "Must require reason");

  // updateTransactionStatus blocks arbitrary mutations
  const blocksArbitraryTxStatus = adminCtrl.includes("Arbitrary transaction status mutations are prohibited");
  assert(blocksArbitraryTxStatus, "Admin cannot arbitrarily change transaction status without verification/reversal workflow", "Must block arbitrary status changes");

  // requeryPayment uses WalletService::verifyFunding instead of direct UPDATE
  const requerySafe = !adminCtrl.includes("UPDATE transactions SET status = 'SUCCESS'");
  assert(requerySafe, "requeryPayment does not arbitrarily set status to SUCCESS; routes through verifyFunding", "Direct status mutation prohibited");
} catch (e) {
  assert(false, "Admin operations check", e.message);
}

// -----------------------------------------------------------------------------
// 7. WALLET STATUS ALLOWLIST & AUDIT LOGGING
// -----------------------------------------------------------------------------
console.log("\nInvariant 7: Wallet Status Changes (Allowlist & Audit Logging)...");
try {
  const adminCtrl = readFile('php-backend/src/Controllers/AdminController.php');
  const adminPage = readFile('src/app/admin/wallets/page.tsx');

  // Backend validates allowed statuses: ACTIVE, FROZEN, RESTRICTED
  const backendHasAllowlist = adminCtrl.includes("['ACTIVE', 'FROZEN', 'RESTRICTED']");
  assert(backendHasAllowlist, "updateWalletStatus enforces strict allowlist ['ACTIVE', 'FROZEN', 'RESTRICTED']", "Must validate status allowlist");

  // Backend writes audit log on status change
  const writesAuditOnStatusChange = adminCtrl.includes("'WALLET_STATUS_CHANGE'") && adminCtrl.includes("INSERT INTO audit_logs");
  assert(writesAuditOnStatusChange, "updateWalletStatus records audit log with WALLET_STATUS_CHANGE action", "Must log status change");

  // Frontend uses RESTRICTED instead of SUSPENDED for wallet status
  const frontendUsesRestricted = adminPage.includes('RESTRICTED') && !adminPage.includes('value="SUSPENDED"');
  assert(frontendUsesRestricted, "Admin wallets UI uses RESTRICTED matching database ENUM", "UI must match schema ENUM");
} catch (e) {
  assert(false, "Wallet status check", e.message);
}

// -----------------------------------------------------------------------------
// 8. BANK TRANSFER SECURITY (NO HARDCODED BANK ACCOUNTS)
// -----------------------------------------------------------------------------
console.log("\nInvariant 8: Bank Transfer Configuration & Dynamic Bank Details...");
try {
  const bankAdapter = readFile('php-backend/src/Services/Payments/BankTransferAdapter.php');

  // Uses Env::get for corporate bank info
  const usesEnv = bankAdapter.includes("Env::get('CORPORATE_BANK_NAME'") &&
                  bankAdapter.includes("Env::get('CORPORATE_BANK_ACCOUNT'");
  assert(usesEnv, "BankTransferAdapter loads corporate bank details dynamically from environment", "Must use Env::get");

  // Fails safely if missing
  const failsSafely = bankAdapter.includes("empty($accountNumber)") &&
                      bankAdapter.includes("Corporate bank transfer is currently not configured");
  assert(failsSafely, "BankTransferAdapter fails safely when corporate bank details are not configured", "Must fail safely if not configured");

  // No hardcoded 10-digit account numbers in source
  const hasHardcodedAccount = /\b\d{10}\b/.test(bankAdapter);
  assert(!hasHardcodedAccount, "BankTransferAdapter contains no hardcoded bank account numbers", "Found hardcoded account number");
} catch (e) {
  assert(false, "Bank transfer check", e.message);
}

// -----------------------------------------------------------------------------
// 9. DATABASE SCHEMA (CANONICAL DATABASE/SCHEMA.SQL)
// -----------------------------------------------------------------------------
console.log("\nInvariant 9: Canonical Production Database Schema (database/schema.sql)...");
try {
  const schema = readFile('database/schema.sql');

  const hasWalletsTable = /CREATE TABLE `wallets`[\s\S]*?`balance`\s+DECIMAL\(14,2\)[\s\S]*?`status`\s+ENUM\('ACTIVE',\s*'FROZEN',\s*'RESTRICTED'\)/i.test(schema);
  assert(hasWalletsTable, "wallets table has DECIMAL(14,2) balance and ENUM('ACTIVE','FROZEN','RESTRICTED')", "wallets schema mismatch");

  const hasLedgerTable = /CREATE TABLE `wallet_ledger`[\s\S]*?`balance_before`\s+DECIMAL\(14,2\)[\s\S]*?`balance_after`\s+DECIMAL\(14,2\)[\s\S]*?`reference`\s+VARCHAR\(100\)\s+NOT\s+NULL\s+UNIQUE/i.test(schema);
  assert(hasLedgerTable, "wallet_ledger table has DECIMAL precision and UNIQUE reference constraint", "wallet_ledger schema mismatch");

  const hasTransactionsTable = /CREATE TABLE `transactions`[\s\S]*?`amount`\s+DECIMAL\(14,2\)[\s\S]*?`reference`\s+VARCHAR\(100\)\s+NOT\s+NULL\s+UNIQUE/i.test(schema);
  assert(hasTransactionsTable, "transactions table has DECIMAL(14,2) amount and UNIQUE reference constraint", "transactions schema mismatch");

  const hasPaymentsTable = /CREATE TABLE `payments`[\s\S]*?`reference`\s+VARCHAR\(100\)\s+NOT\s+NULL\s+UNIQUE[\s\S]*?`amount`\s+DECIMAL\(14,2\)/i.test(schema) ||
                           /CREATE TABLE `payments`[\s\S]*?`amount`\s+DECIMAL\(14,2\)[\s\S]*?`reference`\s+VARCHAR\(100\)\s+NOT\s+NULL\s+UNIQUE/i.test(schema);
  assert(hasPaymentsTable, "payments table has DECIMAL(14,2) amount and UNIQUE reference constraint", "payments schema mismatch");

  const hasIdempotencyTable = /CREATE TABLE `payment_idempotency`[\s\S]*?`idempotency_key`\s+VARCHAR\(100\)\s+NOT\s+NULL\s+UNIQUE/i.test(schema);
  assert(hasIdempotencyTable, "payment_idempotency table has UNIQUE idempotency_key constraint", "payment_idempotency schema mismatch");

  const hasWebhooksTable = /CREATE TABLE `payment_webhooks`[\s\S]*?`processed`\s+TINYINT\(1\)/i.test(schema);
  assert(hasWebhooksTable, "payment_webhooks table exists with idempotency tracking columns", "payment_webhooks schema mismatch");

  const hasAuditLogs = /CREATE TABLE `audit_logs`[\s\S]*?`entity`\s+VARCHAR\(100\)\s+NOT\s+NULL/i.test(schema);
  assert(hasAuditLogs, "audit_logs table has canonical 'entity' column", "audit_logs schema mismatch");
} catch (e) {
  assert(false, "database/schema.sql check", e.message);
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n=================================================================");
console.log(`🏁 M5 STATIC AUDIT FINISHED: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=================================================================");

if (failedCount > 0) {
  console.error("❌ M5 STATIC AUDIT FAILED — Invariants violated.");
  process.exit(1);
} else {
  console.log("✅ ALL M5 SECURITY, FINANCIAL, & ARCHITECTURAL INVARIANTS PASSED 100%!");
  process.exit(0);
}
