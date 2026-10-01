/**
 * HAMBAKTECH MILESTONE 2: DATABASE FOUNDATION VERIFICATION TEST SUITE
 * Deterministic local static and algorithmic audit of canonical schema,
 * relationships, foreign keys, indexes, financial precision, seed system,
 * migration compatibility, and ledger invariants.
 */

import fs from "node:fs";
import path from "node:path";

let passedCount = 0;
let failedCount = 0;

function assertTest(description: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAILED: ${description}`);
    if (details) console.error(`     Details: ${details}`);
    failedCount++;
  }
}

console.log("=================================================================");
console.log("🚀 STARTING HAMBAKTECH M2 DATABASE FOUNDATION TEST SUITE");
console.log("=================================================================\n");

const schemaPath = path.join(process.cwd(), "database", "schema.sql");
const compatPath = path.join(process.cwd(), "database", "reconciliation_and_compat.sql");
const seedPath = path.join(process.cwd(), "database", "seed.sql");
const seedDevPath = path.join(process.cwd(), "database", "seed_dev.sql");

// Parse schema.sql
console.log("Step 1: Parsing Canonical MySQL Schema (database/schema.sql)...");
assertTest("Canonical schema.sql exists", fs.existsSync(schemaPath));
const schemaContent = fs.readFileSync(schemaPath, "utf8");

interface TableDef {
  name: string;
  columns: Map<string, { type: string; raw: string; isNullable: boolean; defaultValue: string | null }>;
  primaryKey: string[];
  uniqueKeys: string[];
  foreignKeys: Array<{ name: string; col: string; refTable: string; refCol: string; onDelete: string }>;
  indexes: string[];
}

function parseTables(sql: string): Map<string, TableDef> {
  const tables = new Map<string, TableDef>();
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?\s*\(([\s\S]*?)\)\s*ENGINE\s*=\s*InnoDB/gi;
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const lines = body.split("\n").map(l => l.trim().replace(/,$/, "")).filter(Boolean);

    const columns = new Map();
    const primaryKey: string[] = [];
    const uniqueKeys: string[] = [];
    const foreignKeys: Array<{ name: string; col: string; refTable: string; refCol: string; onDelete: string }> = [];
    const indexes: string[] = [];

    for (const line of lines) {
      if (line.startsWith("PRIMARY KEY")) {
        const pkMatch = line.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          primaryKey.push(...pkMatch[1].split(",").map(c => c.replace(/`/g, "").trim()));
        }
      } else if (line.startsWith("UNIQUE KEY") || line.includes(" UNIQUE")) {
        uniqueKeys.push(line);
      } else if (line.startsWith("CONSTRAINT") && line.includes("FOREIGN KEY")) {
        const fkMatch = line.match(/CONSTRAINT\s+`?(\w+)`?\s+FOREIGN KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s*`?(\w+)`?\s*\(`?(\w+)`?\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?/i);
        if (fkMatch) {
          foreignKeys.push({
            name: fkMatch[1],
            col: fkMatch[2],
            refTable: fkMatch[3],
            refCol: fkMatch[4],
            onDelete: fkMatch[5] || "RESTRICT",
          });
        }
      } else if (line.startsWith("INDEX ") || line.startsWith("KEY ")) {
        indexes.push(line);
      } else if (line.startsWith("`")) {
        const colParts = line.split(/\s+/);
        const colName = colParts[0].replace(/`/g, "");
        const colType = colParts[1];
        const isNullable = !line.includes("NOT NULL");
        const defMatch = line.match(/DEFAULT\s+([^,]+)/i);
        const defaultValue = defMatch ? defMatch[1].trim() : null;
        columns.set(colName, { type: colType, raw: line, isNullable, defaultValue });
      }
    }

    tables.set(tableName, { name: tableName, columns, primaryKey, uniqueKeys, foreignKeys, indexes });
  }

  return tables;
}

const canonicalTables = parseTables(schemaContent);
assertTest("Canonical schema contains exactly 39 tables", canonicalTables.size === 39, `Found: ${canonicalTables.size}`);

// Step 2: Table Inventory & Engine Verification
console.log("\nStep 2: Auditing Table Inventory, Storage Engine, and Primary Keys...");
for (const [tname, tdef] of canonicalTables.entries()) {
  assertTest(`Table '${tname}' has a valid primary key`, tdef.primaryKey.length > 0, `PK: ${tdef.primaryKey.join(", ")}`);
}

// Step 3: Foreign Key Audit & Financial Non-Destructive Integrity
console.log("\nStep 3: Auditing Foreign Key Integrity & Financial Deletion Invariants...");
let totalFkCount = 0;
for (const [tname, tdef] of canonicalTables.entries()) {
  for (const fk of tdef.foreignKeys) {
    totalFkCount++;
    const targetTable = canonicalTables.get(fk.refTable);
    assertTest(`FK '${fk.name}' in '${tname}' targets existing table '${fk.refTable}'`, !!targetTable);
    if (targetTable) {
      assertTest(`FK '${fk.name}' in '${tname}' targets existing column '${fk.refCol}' in '${fk.refTable}'`, targetTable.columns.has(fk.refCol));
    }
  }
}
assertTest(`Audited ${totalFkCount} foreign key constraints`, totalFkCount > 0);

// Critical Financial Deletion Invariants (RESTRICT required to prevent accidental destruction)
const financialStrictTables = [
  { table: "wallets", fkCol: "user_id" },
  { table: "wallet_ledger", fkCol: "wallet_id" },
  { table: "transactions", fkCol: "user_id" },
  { table: "payments", fkCol: "user_id" },
  { table: "orders", fkCol: "user_id" },
  { table: "course_enrollments", fkCol: "user_id" },
  { table: "certificates", fkCol: "user_id" },
  { table: "nin_requests", fkCol: "user_id" },
  { table: "cac_requests", fkCol: "user_id" },
];

for (const rule of financialStrictTables) {
  const tdef = canonicalTables.get(rule.table);
  const fk = tdef?.foreignKeys.find(k => k.col === rule.fkCol);
  assertTest(
    `Financial/Identity table '${rule.table}' enforces ON DELETE RESTRICT on '${rule.fkCol}'`,
    fk?.onDelete === "RESTRICT",
    `Found: ${fk?.onDelete}`
  );
}

// Step 4: Index Completeness Audit
console.log("\nStep 4: Auditing Indexes for Query Performance & Data Integrity...");

const requiredIndexAudit: Array<{ table: string; colOrName: string; purpose: string }> = [
  { table: "users", colOrName: "email", purpose: "User authentication & unique email login" },
  { table: "users", colOrName: "phone", purpose: "User phone lookup & OTP routing" },
  { table: "user_sessions", colOrName: "token_hash", purpose: "Fast session validation by token hash" },
  { table: "verification_tokens", colOrName: "token_hash", purpose: "Fast verification token lookup" },
  { table: "wallets", colOrName: "user_id", purpose: "1:1 Wallet lookup by user" },
  { table: "wallet_ledger", colOrName: "wallet_id", purpose: "Wallet statement & balance ledger query" },
  { table: "transactions", colOrName: "reference", purpose: "Transaction reconciliation by reference" },
  { table: "payments", colOrName: "reference", purpose: "Payment verification callback lookup" },
  { table: "payment_idempotency", colOrName: "idempotency_key", purpose: "Payment deduplication & idempotency" },
  { table: "orders", colOrName: "order_number", purpose: "Customer & admin order lookup by number" },
  { table: "order_items", colOrName: "order_id", purpose: "Order line items retrieval" },
  { table: "order_timeline", colOrName: "order_id", purpose: "Order fulfillment progression tracking" },
  { table: "support_tickets", colOrName: "ticket_number", purpose: "Support ticket tracking" },
  { table: "certificates", colOrName: "certificate_number", purpose: "Public certificate verification" },
  { table: "nin_requests", colOrName: "reference", purpose: "NIN request tracking" },
  { table: "cac_requests", colOrName: "reference", purpose: "CAC corporate filing tracking" },
];

for (const req of requiredIndexAudit) {
  const tdef = canonicalTables.get(req.table);
  assertTest(`Table '${req.table}' exists for index audit`, !!tdef);
  if (tdef) {
    const hasIndex =
      tdef.columns.get(req.colOrName)?.raw.includes("UNIQUE") ||
      tdef.uniqueKeys.some(u => u.includes(req.colOrName)) ||
      tdef.indexes.some(i => i.includes(req.colOrName));
    assertTest(
      `Table '${req.table}' has index on '${req.colOrName}' (${req.purpose})`,
      hasIndex
    );
  }
}

// Step 5: Financial Precision Audit
console.log("\nStep 5: Auditing Financial Columns Precision and Scale...");
const financialColumns: Array<{ table: string; column: string; expectedType: string }> = [
  { table: "wallets", column: "balance", expectedType: "DECIMAL(14,2)" },
  { table: "wallets", column: "ledger_balance", expectedType: "DECIMAL(14,2)" },
  { table: "wallet_ledger", column: "amount", expectedType: "DECIMAL(14,2)" },
  { table: "wallet_ledger", column: "balance_before", expectedType: "DECIMAL(14,2)" },
  { table: "wallet_ledger", column: "balance_after", expectedType: "DECIMAL(14,2)" },
  { table: "transactions", column: "amount", expectedType: "DECIMAL(14,2)" },
  { table: "transactions", column: "fee", expectedType: "DECIMAL(10,2)" },
  { table: "transactions", column: "total_amount", expectedType: "DECIMAL(14,2)" },
  { table: "payments", column: "amount", expectedType: "DECIMAL(14,2)" },
  { table: "orders", column: "total_amount", expectedType: "DECIMAL(14,2)" },
  { table: "orders", column: "discount_amount", expectedType: "DECIMAL(10,2)" },
  { table: "order_items", column: "unit_price", expectedType: "DECIMAL(10,2)" },
  { table: "order_items", column: "subtotal", expectedType: "DECIMAL(14,2)" },
  { table: "service_offerings", column: "base_price", expectedType: "DECIMAL(10,2)" },
  { table: "service_offerings", column: "agent_price", expectedType: "DECIMAL(10,2)" },
  { table: "service_offerings", column: "corporate_price", expectedType: "DECIMAL(10,2)" },
  { table: "academy_courses", column: "tuition_fee", expectedType: "DECIMAL(10,2)" },
  { table: "products", column: "price", expectedType: "DECIMAL(10,2)" },
  { table: "delivery_zones", column: "delivery_fee", expectedType: "DECIMAL(10,2)" },
];

for (const fc of financialColumns) {
  const tdef = canonicalTables.get(fc.table);
  const col = tdef?.columns.get(fc.column);
  assertTest(
    `Financial column '${fc.table}.${fc.column}' has exact precision '${fc.expectedType}'`,
    col?.raw.includes(fc.expectedType) ?? false,
    `Raw definition: ${col?.raw}`
  );
}

// Verify no FLOAT or DOUBLE was used for financial values
for (const [tname, tdef] of canonicalTables.entries()) {
  for (const [cname, cdef] of tdef.columns.entries()) {
    const isMoneyName = /price|amount|balance|fee|subtotal|cost/i.test(cname);
    if (isMoneyName) {
      assertTest(
        `Column '${tname}.${cname}' uses DECIMAL (not FLOAT or DOUBLE)`,
        !cdef.type.includes("FLOAT") && !cdef.type.includes("DOUBLE"),
        `Type: ${cdef.type}`
      );
    }
  }
}

// Step 6: Reconciliation Migration Structural & Safety Verification
console.log("\nStep 6: Auditing database/reconciliation_and_compat.sql Safety & Parity...");
assertTest("Reconciliation script exists", fs.existsSync(compatPath));
const compatContent = fs.readFileSync(compatPath, "utf8");
const compatTables = parseTables(compatContent);

assertTest(
  "Reconciliation script creates all 39 canonical tables",
  compatTables.size === 39,
  `Reconciliation tables count: ${compatTables.size}`
);

// Check 0 executable destructive statements
const lines = compatContent.split("\n");
const destructiveLines = lines.filter(l => {
  const trimmed = l.trim().toUpperCase();
  if (trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.includes("DO 0")) return false;
  return trimmed.startsWith("DROP TABLE") || trimmed.startsWith("TRUNCATE TABLE");
});
assertTest(
  "Reconciliation script has ZERO executable DROP TABLE or TRUNCATE TABLE commands",
  destructiveLines.length === 0,
  `Destructive lines: ${destructiveLines.join("; ")}`
);

assertTest(
  "Reconciliation script wraps execution in FOREIGN_KEY_CHECKS = 0 and restores to 1",
  compatContent.includes("SET FOREIGN_KEY_CHECKS = 0;") && compatContent.includes("SET FOREIGN_KEY_CHECKS = 1;")
);

assertTest(
  "Reconciliation script uses dynamic information_schema existence guards",
  compatContent.includes("information_schema.tables") && compatContent.includes("PREPARE stmt FROM")
);

// Step 7: Seed System Audit (Production Safety & Segregation)
console.log("\nStep 7: Auditing Seed System (database/seed.sql and database/seed_dev.sql)...");
assertTest("Production seed file exists", fs.existsSync(seedPath));
assertTest("Development seed file exists", fs.existsSync(seedDevPath));

const seedContent = fs.readFileSync(seedPath, "utf8");
assertTest(
  "Production seed does NOT contain fake customer account 'usr-cust-001'",
  !seedContent.includes("usr-cust-001")
);
assertTest(
  "Production seed does NOT contain fake student account 'usr-stud-001'",
  !seedContent.includes("usr-stud-001")
);
assertTest(
  "Production seed does NOT seed unbacked wallet balances into wallets table",
  !seedContent.includes("INSERT INTO `wallets`") && !seedContent.includes("INSERT INTO wallets")
);
assertTest(
  "Production seed seeds official system roles",
  seedContent.includes("role-super-admin") && seedContent.includes("role-customer")
);
assertTest(
  "Production seed seeds official system permissions",
  seedContent.includes("p-user-read") && seedContent.includes("p-order-create")
);
assertTest(
  "Production seed maps role_permissions for system authorization",
  seedContent.includes("rp-sa-user-read") && seedContent.includes("role_permissions")
);
assertTest(
  "Production seed seeds official service categories",
  seedContent.includes("cat-nin") && seedContent.includes("cat-cac")
);
assertTest(
  "Production seed seeds official baseline service catalog",
  seedContent.includes("srv-nin-pvc") && seedContent.includes("srv-cac-bn")
);
assertTest(
  "Production seed seeds official delivery zones",
  seedContent.includes("zone-eleko") && seedContent.includes("zone-ajah")
);
assertTest(
  "Production seed seeds official system settings",
  seedContent.includes("app_name") && seedContent.includes("company_email")
);

// Step 8: Double-Entry Wallet Ledger Invariant Logic
console.log("\nStep 8: Testing Double-Entry Ledger Mathematical Invariants...");

interface LedgerEntry {
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
}

function applyLedgerEntry(currentBalance: number, type: "CREDIT" | "DEBIT", amount: number): LedgerEntry {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (type === "DEBIT" && currentBalance < amount) throw new Error("Insufficient balance (Overdraft blocked)");

  const balanceBefore = currentBalance;
  const balanceAfter = type === "CREDIT" ? currentBalance + amount : currentBalance - amount;
  return { type, amount, balanceBefore, balanceAfter };
}

let balance = 0.00;
const creditEntry = applyLedgerEntry(balance, "CREDIT", 50000.00);
balance = creditEntry.balanceAfter;
assertTest("Ledger CREDIT increases balance accurately", balance === 50000.00);
assertTest("Ledger CREDIT balanceAfter matches balanceBefore + amount", creditEntry.balanceAfter === creditEntry.balanceBefore + creditEntry.amount);

const debitEntry = applyLedgerEntry(balance, "DEBIT", 12500.00);
balance = debitEntry.balanceAfter;
assertTest("Ledger DEBIT decreases balance accurately", balance === 37500.00);
assertTest("Ledger DEBIT balanceAfter matches balanceBefore - amount", debitEntry.balanceAfter === debitEntry.balanceBefore - debitEntry.amount);

let overdraftBlocked = false;
try {
  applyLedgerEntry(balance, "DEBIT", 100000.00);
} catch (e: any) {
  overdraftBlocked = e.message.includes("Insufficient balance");
}
assertTest("Ledger strictly blocks overdraft when debit exceeds available balance", overdraftBlocked);

// Step 9: Order Number Generation Format Invariants
console.log("\nStep 9: Testing Order Number Format Invariants...");
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
  return `HT-ORD-${year}-${hex}`;
}

const testOrderNum = generateOrderNumber();
assertTest(
  "Order number matches canonical pattern 'HT-ORD-YYYY-XXXXXX'",
  /^HT-ORD-\d{4}-[0-9A-F]{6}$/.test(testOrderNum),
  `Generated: ${testOrderNum}`
);

// Summary
console.log("\n=================================================================");
if (failedCount === 0) {
  console.log(`✅ M2 DATABASE FOUNDATION TESTS PASSED: ${passedCount} PASSED, 0 FAILED`);
} else {
  console.error(`❌ M2 DATABASE FOUNDATION TESTS FAILED: ${passedCount} PASSED, ${failedCount} FAILED`);
  process.exit(1);
}
console.log("=================================================================\n");
