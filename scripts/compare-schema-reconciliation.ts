import * as fs from 'fs';
import * as path from 'path';

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  extra?: string;
  raw: string;
}

interface TableDef {
  name: string;
  columns: Map<string, ColumnDef>;
  primaryKey: string[];
  uniqueKeys: Map<string, string[]>;
  indexes: Map<string, string[]>;
  foreignKeys: Map<string, string>;
  rawSql: string;
}

function normalizeSql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');
}

function parseTables(filePath: string): Map<string, TableDef> {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleanSql = normalizeSql(content);

  const tables = new Map<string, TableDef>();

  // Regex to match CREATE TABLE [IF NOT EXISTS] `table_name` (...)
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?\s*\(([\s\S]*?)\)\s*(?:ENGINE\s*=\s*[a-zA-Z0-9_]+)?\s*(?:DEFAULT\s+CHARSET\s*=\s*[a-zA-Z0-9_]+)?\s*(?:COLLATE\s*=\s*[a-zA-Z0-9_]+)?;/gi;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(cleanSql)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];

    const tableDef: TableDef = {
      name: tableName,
      columns: new Map(),
      primaryKey: [],
      uniqueKeys: new Map(),
      indexes: new Map(),
      foreignKeys: new Map(),
      rawSql: match[0],
    };

    // Split body by lines/commas taking into account parentheses
    const lines: string[] = [];
    let cur = '';
    let depth = 0;
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 0) {
        lines.push(cur.trim());
        cur = '';
        continue;
      }
      cur += c;
    }
    if (cur.trim()) lines.push(cur.trim());

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Check for PRIMARY KEY
      const pkMatch = line.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        tableDef.primaryKey = pkMatch[1].split(',').map(s => s.trim().replace(/`/g, '').toLowerCase());
        continue;
      }

      // Check for UNIQUE KEY
      const uqMatch = line.match(/^UNIQUE(?:\s+KEY|\s+INDEX)?\s+(?:`?([a-zA-Z0-9_]+)`?\s*)?\(([^)]+)\)/i);
      if (uqMatch) {
        const uqName = (uqMatch[1] || 'uq_' + tableDef.uniqueKeys.size).toLowerCase();
        const cols = uqMatch[2].split(',').map(s => s.trim().replace(/`/g, '').toLowerCase());
        tableDef.uniqueKeys.set(uqName, cols);
        continue;
      }

      // Check for KEY / INDEX
      const idxMatch = line.match(/^(?:KEY|INDEX)\s+`?([a-zA-Z0-9_]+)`?\s*\(([^)]+)\)/i);
      if (idxMatch) {
        const idxName = idxMatch[1].toLowerCase();
        const cols = idxMatch[2].split(',').map(s => s.trim().replace(/`/g, '').toLowerCase());
        tableDef.indexes.set(idxName, cols);
        continue;
      }

      // Check for CONSTRAINT ... FOREIGN KEY
      const fkMatch = line.match(/^(?:CONSTRAINT\s+`?([a-zA-Z0-9_]+)`?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+`?([a-zA-Z0-9_]+)`?\s*\(([^)]+)\)([\s\S]*)/i);
      if (fkMatch) {
        const fkName = (fkMatch[1] || 'fk_' + tableDef.foreignKeys.size).toLowerCase();
        const col = fkMatch[2].replace(/`/g, '').trim().toLowerCase();
        const refTable = fkMatch[3].replace(/`/g, '').trim().toLowerCase();
        const refCol = fkMatch[4].replace(/`/g, '').trim().toLowerCase();
        const actions = (fkMatch[5] || '').trim().replace(/\s+/g, ' ').toUpperCase();
        tableDef.foreignKeys.set(fkName, `${col} -> ${refTable}(${refCol}) ${actions}`);
        continue;
      }

      // Otherwise it's a column definition: `col_name` TYPE [NULL|NOT NULL] [DEFAULT ...] [AUTO_INCREMENT] ...
      const colMatch = line.match(/^`?([a-zA-Z0-9_]+)`?\s+([A-Za-z0-9_]+(?:\([^)]+\))?)([\s\S]*)$/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].toUpperCase();
        const rest = colMatch[3];

        const notNull = /\bNOT\s+NULL\b/i.test(rest);
        const defMatch = rest.match(/\bDEFAULT\s+([^,]+)/i);
        let defaultValue: string | undefined;
        if (defMatch) {
          defaultValue = defMatch[1].trim();
        }

        tableDef.columns.set(colName, {
          name: colName,
          type: colType,
          nullable: !notNull,
          defaultValue,
          raw: line,
        });
      }
    }

    tables.set(tableName, tableDef);
  }

  return tables;
}

console.log('=================================================================');
console.log('🔬 HAMBAKTECH DETERMINISTIC STRUCTURAL SCHEMA COMPARATOR');
console.log('=================================================================\n');

const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
const reconcilPath = path.resolve(process.cwd(), 'database/reconciliation_and_compat.sql');

const schemaTables = parseTables(schemaPath);
const reconcilTables = parseTables(reconcilPath);

console.log(`Parsed ${schemaTables.size} tables from canonical database/schema.sql`);
console.log(`Parsed ${reconcilTables.size} tables from database/reconciliation_and_compat.sql\n`);

let diffCount = 0;

for (const [tableName, sTable] of schemaTables) {
  const rTable = reconcilTables.get(tableName);
  if (!rTable) {
    console.error(`❌ Table [${tableName}] missing in reconciliation_and_compat.sql`);
    diffCount++;
    continue;
  }

  // Check columns
  for (const [colName, sCol] of sTable.columns) {
    const rCol = rTable.columns.get(colName);
    if (!rCol) {
      console.error(`❌ Table [${tableName}]: column \`${colName}\` missing in reconciliation`);
      diffCount++;
      continue;
    }

    // Compare normalized type (e.g. VARCHAR(255) vs VARCHAR(255))
    const sType = sCol.type.replace(/\s+/g, '');
    const rType = rCol.type.replace(/\s+/g, '');
    if (sType !== rType) {
      console.warn(`⚠️ Table [${tableName}].\`${colName}\` type mismatch: schema=${sCol.type}, reconcil=${rCol.type}`);
      diffCount++;
    }

    // Compare nullability
    if (sCol.nullable !== rCol.nullable) {
      console.warn(`⚠️ Table [${tableName}].\`${colName}\` nullability mismatch: schema nullable=${sCol.nullable}, reconcil nullable=${rCol.nullable}`);
      diffCount++;
    }
  }

  // Check for extra columns in reconcil
  for (const [colName] of rTable.columns) {
    if (!sTable.columns.has(colName)) {
      console.error(`❌ Table [${tableName}]: extra column \`${colName}\` in reconciliation not present in schema.sql`);
      diffCount++;
    }
  }

  // Check Primary Key
  const sPk = sTable.primaryKey.join(',');
  const rPk = rTable.primaryKey.join(',');
  if (sPk !== rPk) {
    console.warn(`⚠️ Table [${tableName}] PK mismatch: schema=[${sPk}], reconcil=[${rPk}]`);
    diffCount++;
  }

  // Check Unique Keys
  for (const [uqName, cols] of sTable.uniqueKeys) {
    const sColsStr = cols.join(',');
    // Check if rTable has a unique key with same columns
    const matchingR = Array.from(rTable.uniqueKeys.values()).find(rCols => rCols.join(',') === sColsStr);
    if (!matchingR) {
      console.warn(`⚠️ Table [${tableName}] missing UNIQUE constraint on (${sColsStr}) in reconciliation`);
      diffCount++;
    }
  }

  // Check Indexes
  for (const [idxName, cols] of sTable.indexes) {
    const sColsStr = cols.join(',');
    const matchingR = Array.from(rTable.indexes.values()).find(rCols => rCols.join(',') === sColsStr);
    if (!matchingR) {
      console.warn(`⚠️ Table [${tableName}] missing INDEX on (${sColsStr}) in reconciliation`);
      diffCount++;
    }
  }

  // Check Foreign Keys
  for (const [fkName, fkDef] of sTable.foreignKeys) {
    const matchingR = Array.from(rTable.foreignKeys.values()).find(rDef => rDef === fkDef);
    if (!matchingR) {
      console.warn(`⚠️ Table [${tableName}] FK mismatch: expected [${fkDef}]`);
      diffCount++;
    }
  }
}

console.log('\n-----------------------------------------------------------------');
if (diffCount === 0) {
  console.log(`✅ 100% PERFECT STRUCTURAL PARITY: All ${schemaTables.size} tables match identically.`);
} else {
  console.log(`⚠️ Found ${diffCount} differences between schema.sql and reconciliation_and_compat.sql.`);
}
console.log('-----------------------------------------------------------------\n');
