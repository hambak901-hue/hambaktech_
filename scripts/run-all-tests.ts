/**
 * HAMBAKTECH UNIFIED TEST RUNNER
 * Executes all verification test suites in sequence and asserts full platform integrity.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const suites = [
  { name: "M4 Auth & RBAC Suite", script: "scripts/test-m4-auth.ts" },
  { name: "Wallet Operations & Orders Suite", script: "scripts/test-wallet-orders.ts" },
  { name: "File Security & Webhooks Suite", script: "scripts/test-security-webhooks.ts" },
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
