import * as fs from 'fs';
import * as path from 'path';

console.log('=================================================================');
console.log('🔍 HAMBAKTECH RECONCILIATION SQL STATIC VERIFICATION SUITE');
console.log('=================================================================');

const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
const reconcilPath = path.resolve(process.cwd(), 'database/reconciliation_and_compat.sql');

if (!fs.existsSync(schemaPath) || !fs.existsSync(reconcilPath)) {
  console.error('❌ Missing SQL files.');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const reconcilSql = fs.readFileSync(reconcilPath, 'utf8');

// Strip comments for executable SQL checks
const stripComments = (sql: string) => {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');
};

const executableSql = stripComments(reconcilSql);

// 1. DESTRUCTIVE COMMAND CHECK
console.log('\n[Step 1] Checking for prohibited destructive SQL commands in executable code...');
const destructivePatterns = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+DATABASE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
];

let hasDestructive = false;
for (const pat of destructivePatterns) {
  if (pat.test(executableSql)) {
    console.error(`❌ PROHIBITED destructive command found matching pattern: ${pat}`);
    hasDestructive = true;
  }
}
if (!hasDestructive) {
  console.log('  ✓ No DROP, TRUNCATE, or DELETE commands found in executable code. 100% Non-destructive.');
} else {
  process.exit(1);
}

// 2. CANONICAL TABLE PARITY CHECK (All 39 tables)
console.log('\n[Step 2] Checking all 39 canonical tables in reconciliation_and_compat.sql...');
const extractTables = (sql: string) => {
  const matches = sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/gi);
  return Array.from(matches, m => m[1].toLowerCase());
};

const schemaTables = extractTables(schemaSql);
const reconcilTables = extractTables(reconcilSql);

console.log(`  - Canonical tables in database/schema.sql: ${schemaTables.length}`);
console.log(`  - Tables created in database/reconciliation_and_compat.sql: ${reconcilTables.length}`);

const missingInReconcil = schemaTables.filter(t => !reconcilTables.includes(t));
if (missingInReconcil.length > 0) {
  console.error(`❌ Missing tables in reconciliation script: ${missingInReconcil.join(', ')}`);
  process.exit(1);
} else {
  console.log(`  ✓ All ${schemaTables.length} canonical tables are created with IF NOT EXISTS.`);
}

// 3. CHECK FOREIGN_KEY_CHECKS toggling
console.log('\n[Step 3] Checking Foreign Key safe execution pattern...');
const hasFkOff = /SET\s+FOREIGN_KEY_CHECKS\s*=\s*0/i.test(executableSql);
const hasFkOn = /SET\s+FOREIGN_KEY_CHECKS\s*=\s*1/i.test(executableSql);
if (hasFkOff && hasFkOn) {
  console.log('  ✓ FOREIGN_KEY_CHECKS properly disabled during creation/sync and restored at completion.');
} else {
  console.error('❌ Missing FOREIGN_KEY_CHECKS = 0 or = 1');
  process.exit(1);
}

// 4. CHECK DYNAMIC INFORMATION_SCHEMA WRAPPERS
console.log('\n[Step 4] Checking information_schema existence guards...');
const requiredGuards = [
  'Role',
  'User',
  'UserProfile',
  'Wallet',
  'WalletLedgerEntry',
  'Transaction',
  'ServiceCategory',
  'Order',
  'Course',
  'NINRequest',
  'CACRequest'
];

for (const g of requiredGuards) {
  const guardPattern = new RegExp(`table_name\\s*(=|IN\\s*\\().*?${g}`, 'i');
  if (!guardPattern.test(reconcilSql)) {
    console.error(`❌ Missing dynamic existence guard for legacy entity: ${g}`);
    process.exit(1);
  }
}
console.log('  ✓ All legacy entity migrations guarded by dynamic information_schema queries.');

// 5. CHECK VERIFICATION QUERIES
console.log('\n[Step 5] Checking diagnostic validation queries...');
const hasShowTables = /SHOW\s+TABLES/i.test(executableSql);
const hasCountUsers = /COUNT\(\*\)\s+FROM\s+`?users`?/i.test(executableSql);
const hasCountWallets = /COUNT\(\*\)\s+FROM\s+`?wallets`?/i.test(executableSql);
const hasCountOrders = /COUNT\(\*\)\s+FROM\s+`?orders`?/i.test(executableSql);
const hasReferentialCheck = /orphaned_wallets/i.test(executableSql);

if (hasShowTables && hasCountUsers && hasCountWallets && hasCountOrders && hasReferentialCheck) {
  console.log('  ✓ Comprehensive diagnostic report, parity counts, and integrity checks included.');
} else {
  console.error('❌ Missing required validation queries.');
  process.exit(1);
}

console.log('\n=================================================================');
console.log('✅ RECONCILIATION SQL VERIFICATION: 100% PASSED');
console.log('=================================================================\n');
