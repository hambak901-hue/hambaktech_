/**
 * HAMBAKTECH UNIFIED TEST RUNNER
 * Executes all verification test suites in sequence and asserts full platform integrity.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const suites = [
  { name: "M2 Database Foundation Suite", script: "scripts/test-m2-database.ts" },
  { name: "M3 Authentication Audit Suite", script: "scripts/test-m3-auth.ts" },
  { name: "M4 Auth & RBAC Suite", script: "scripts/test-m4-auth.ts" },
  { name: "M4 User & Customer Management Suite", script: "scripts/test-m4-user-management.ts" },
  { name: "M5 Wallet & Financial Foundation Suite", script: "scripts/test-m5-wallet-financial.ts" },
  { name: "NIN + BVN + Payment Providers Audit Suite", script: "scripts/test-nin-bvn-payments-audit.ts" },
  { name: "Wallet Operations & Orders Suite", script: "scripts/test-wallet-orders.ts" },
  { name: "File Security & Webhooks Suite", script: "scripts/test-security-webhooks.ts" },
  { name: "Reconciliation SQL Verification", script: "scripts/verify-reconciliation-sql.ts" },
  { name: "Schema Parity Comparator", script: "scripts/compare-schema-reconciliation.ts" },
  { name: "M7 Provider Static & Security Audit Suite", script: "scripts/test-m7-provider-static.js" },
  { name: "M7 Veripine & VTpass Provider Lifecycle Suite", script: "scripts/test-m7-provider-lifecycle.ts" },
  { name: "M7 VTU.ng Provider Lifecycle & Resilience Suite", script: "scripts/test-vtung-provider-lifecycle.ts" },
  { name: "Email & SMTP Delivery Readiness Suite", script: "scripts/test-email-flows.ts" },
  { name: "Public Website & Auth Cleanup Regression Suite", script: "scripts/test-public-auth-regression.ts" },
  { name: "Forensic Login & Super Admin / Support Admin RBAC Suite", script: "scripts/test-login-and-rbac.ts" },
];


console.log("=================================================================");
console.log("🛡️  HAMBAKTECH PLATFORM TEST RUNNER");
console.log("=================================================================\n");

let totalExitCode = 0;

for (const suite of suites) {
  console.log(`\n▶️  Executing: ${suite.name} (${suite.script})...\n`);
  const result = spawnSync("npx", ["tsx", suite.script], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\n❌ Suite Failed: ${suite.name} with exit code ${result.status}`);
    totalExitCode = 1;
    break;
  }
}

if (totalExitCode === 0) {
  console.log("\n=================================================================");
  console.log("✅ ALL PLATFORM VERIFICATION TEST SUITES PASSED (100% SUCCESS)");
  console.log("=================================================================\n");
} else {
  console.error("\n❌ ONE OR MORE TEST SUITES FAILED.\n");
  process.exit(1);
}
