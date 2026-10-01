# HAMBAKTECH SMART DIGITAL PLATFORM v1.0 — PRODUCTION DATABASE SETUP

**Target Host**: Truehost cPanel / Linux Shared or Managed Hosting  
**RDBMS**: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine)  
**Character Set**: `utf8mb4`  
**Collation**: `utf8mb4_unicode_ci`  
**Authoritative Schemas**:  
1. `database/schema.sql` (39 Base Canonical Tables)  
2. `database/migrations/2026-09-28-identity-telecom.sql` (2 M7 Provider Tables)  
3. `database/seed.sql` (Safe System RBAC, Catalog, and Gateway Bootstrap)

---

## 1. Create Production Database & User in cPanel

### Via cPanel MySQL Database Wizard (Recommended)
1. Log in to your Truehost cPanel dashboard.
2. Under the **Databases** section, click **MySQL Database Wizard**.
3. **Step 1 — Create A Database**:
   - Enter database name suffix: `portal` (e.g., `hambakte_portal`).
   - Click **Next Step**.
4. **Step 2 — Create Database Users**:
   - Enter username suffix: `dbuser` (e.g., `hambakte_dbuser`).
   - Use the **Password Generator** to create a 24+ character password with letters, digits, and symbols.
   - Record this password securely for the `.env` file (`DB_PASSWORD`).
   - Click **Create User**.
5. **Step 3 — Add User to Database**:
   - Check **ALL PRIVILEGES** (requires `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`, `INDEX`, `ALTER`, `LOCK TABLES`, `CREATE TEMPORARY TABLES`, `REFERENCES`).
   - Click **Make Changes**.

### Via MySQL Command-Line (If Shell / Terminal is Enabled)
```sql
CREATE DATABASE `hambakte_portal` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'hambakte_dbuser'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD_HERE';

GRANT ALL PRIVILEGES ON `hambakte_portal`.* TO 'hambakte_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

---

## 2. Production Database Import Order

Execute the SQL scripts in this exact sequence to ensure foreign key dependencies and referential integrity are strictly maintained:

### Step 2.1 — Import Canonical Base Schema (`database/schema.sql`)
This creates the 39 foundation tables:
- Core: `users`, `user_profiles`, `user_sessions`, `password_resets`, `email_verifications`
- RBAC: `roles`, `permissions`, `role_permissions`, `user_roles`
- Wallets: `wallets`, `wallet_transactions`, `wallet_ledger`, `wallet_funding_requests`
- Payments: `payments`, `payment_providers`, `payment_webhooks`
- Orders & Services: `service_categories`, `services`, `pricing_tiers`, `orders`, `order_items`, `order_status_history`
- Auditing & Compliance: `audit_logs`, `system_settings`, `notification_templates`, `notifications`
- Business Units: `academy_courses`, `academy_enrollments`, `academy_certificates`, `shop_products`, `shop_orders`, `shop_order_items`, `support_tickets`, `support_messages`

**Via phpMyAdmin**:
1. Open **phpMyAdmin** from cPanel.
2. Select `hambakte_portal` in the left sidebar.
3. Click the **Import** tab.
4. Click **Choose File** and select `database/schema.sql`.
5. Ensure Character Set is `utf-8`. Click **Import**.

**Via cPanel Terminal / CLI**:
```bash
mysql -u hambakte_dbuser -p hambakte_portal < database/schema.sql
```

### Step 2.2 — Import Milestone 7 Migrations (`database/migrations/2026-09-28-identity-telecom.sql`)
This adds the two provider transaction tracking tables:
1. `identity_verifications` (Tracks Veripine NIN & BVN requests with atomic debit reference)
2. `telecom_transactions` (Tracks VTpass & VTU.ng airtime, data, power, and TV purchases)

**Via phpMyAdmin**:
- Click **Import**, select `database/migrations/2026-09-28-identity-telecom.sql`, and click **Import**.

**Via CLI**:
```bash
mysql -u hambakte_dbuser -p hambakte_portal < database/migrations/2026-09-28-identity-telecom.sql
```

### Step 2.3 — Import Safe Production System Seeds (`database/seed.sql`)
This injects the system roles, permissions, RBAC matrix, service categories, initial services catalogue, and supported payment methods.
- **Zero fake users**
- **Zero fake balances**
- **Zero fake transactions**
- **Zero fake provider credentials**

**Via phpMyAdmin**:
- Click **Import**, select `database/seed.sql`, and click **Import**.

**Via CLI**:
```bash
mysql -u hambakte_dbuser -p hambakte_portal < database/seed.sql
```

---

## 3. Schema Verification & Post-Import Diagnostic Queries

Run the following SQL queries in the phpMyAdmin **SQL** tab to verify that your production database is 100% complete and sound.

### 3.1 Table Count Check (Must Return Exactly 41 Tables)
```sql
SELECT COUNT(*) AS total_tables 
FROM information_schema.tables 
WHERE table_schema = DATABASE();
-- Expected output: 41
```

### 3.2 List All Canonical Tables
```sql
SELECT table_name, engine, table_rows, data_length, create_time 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
ORDER BY table_name ASC;
```

### 3.3 Verify Roles and Permissions Matrix
```sql
SELECT 
    r.slug AS role_slug,
    r.name AS role_name,
    COUNT(rp.permission_id) AS assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.slug, r.name
ORDER BY assigned_permissions DESC;
```
*Expected: `super_admin` must have all system permissions mapped.*

### 3.4 Verify Critical Constraints & Foreign Keys
```sql
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = DATABASE()
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY table_name, constraint_type;
```

---

## 4. First Super Administrator Account Setup

Do NOT use development passwords in production. Run the following command or administrative registration to create your initial super administrator:

1. Register an account through the web portal (`/signup`):
   - Email: `admin@hambaktech.com.ng`
   - Secure Password: Choose a strong, unique 16+ character password.
2. In phpMyAdmin, elevate this user to Super Admin:
```sql
UPDATE users 
SET role_id = 'role-super-admin', 
    status = 'ACTIVE', 
    email_verified_at = NOW() 
WHERE email = 'admin@hambaktech.com.ng';
```

---

## 5. Automated Backup & Rollback Procedures

### 5.1 Automated Nightly cPanel Backup via Cron
Configure a daily cron job in cPanel to dump the database to your private storage directory:
```bash
0 2 * * * mysqldump -u hambakte_dbuser -p'YOUR_PASSWORD' hambakte_portal | gzip > /home/hambakte/db_backups/portal_$(date +\%F).sql.gz
```
*Ensure `/home/hambakte/db_backups` exists with `chmod 700`.*

### 5.2 Rollback Procedure
If a migration or bad deployment needs to be restored:
```bash
gunzip < /home/hambakte/db_backups/portal_YYYY-MM-DD.sql.gz | mysql -u hambakte_dbuser -p hambakte_portal
```
