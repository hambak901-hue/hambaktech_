# HambakTech Smart Digital Platform — Deployment Specifications

**Production Domain:** `hambaktech.com.ng`  
**Admin Subdomain:** `admin.hambaktech.com.ng`  
**Hosting Environment:** cPanel Shared Hosting  
**Status:** SPECIFICATION BASELINE (Zero production deployment executed in Milestone 1)  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. Hosting Environment & Infrastructure

### 1.1 Target Specifications
- **Primary Domain:** `hambaktech.com.ng`
- **Administrative Portal:** `admin.hambaktech.com.ng` (or `/admin` routed view)
- **Web Server:** Apache with `mod_rewrite` enabled on cPanel
- **PHP Runtime:** Target 8.2 or 8.3 *(To be verified in cPanel)*
- **Database Engine:** MySQL 8.0+ or MariaDB 10.5+ *(To be verified in cPanel)*
- **Mail Server:** cPanel Exim Mail Transfer Agent via standard secure SMTP (Port 465 SSL / 587 TLS)
- **SSL Certificate:** AutoSSL (cPanel Sectigo or Let's Encrypt automated TLS)
- **Cron Service:** cPanel Crontab for scheduled tasks (e.g. pending payment reconciliation, subscription status checks)

### 1.2 Credential & Secret Management
> **SECURITY DIRECTIVE:** Never write plaintext credentials, database passwords, or private API keys into version control. All secrets are documented using placeholder references and configured directly within cPanel or secure production environment files.

- **Database Password:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **cPanel Master Password:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **SMTP Mailbox Password:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **Paystack Secret Key:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **Flutterwave Secret Key:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **Remita API Key:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`
- **Identity Provider Secrets:** `[CONFIGURED SECRET — NOT STORED IN REPOSITORY]`

---

## 2. Frontend Deployment Strategy (cPanel Options)

### Strategy A: Next.js Static Export (Recommended for cPanel Shared Hosting)
- **Build Command:** `npm run build` with `output: 'export'` in `next.config.js` produces a standalone `out/` folder.
- **Deployment:** The contents of `out/` are uploaded to `public_html/`.
- **Advantages:** Blazing-fast static asset delivery, zero Node.js daemon memory usage, zero crash recovery overhead on shared hosting, maximum compatibility with Apache `.htaccess` routing.
- **API Interaction:** All interactive data operations call the backend PHP REST endpoints at `https://hambaktech.com.ng/api/v1/*`.

### Strategy B: Node.js Application Manager (Subject to cPanel capabilities)
- If the cPanel host provides the **Setup Node.js App** (Passenger) feature with sufficient memory allocation (≥ 512MB RAM), Next.js can run as a persistent server.
- *Verification Requirement:* Must inspect cPanel feature list before committing to Node daemon hosting.

---

## 3. Future Production Deployment Checklist (Milestone 12)

Before production launch in Milestone 12, every item on this checklist must be verified:

- [ ] **PHP Version:** Verify PHP 8.2+ is active in cPanel MultiPHP Manager.
- [ ] **PHP Extensions:** Verify required modules (`pdo_mysql`, `mbstring`, `openssl`, `curl`, `json`, `gd`, `fileinfo`, `zip`).
- [ ] **MySQL/MariaDB:** Verify database server version, create database `hambaktech_db`, and assign user with least-privilege permissions.
- [ ] **HTTPS & SSL:** Verify AutoSSL certificate is issued and enforces strict HTTPS redirection.
- [ ] **Apache Rewrite Rules (`.htaccess`):** Configure routing for static HTML sub-paths and `/api` REST requests.
- [ ] **Database Schemas & Migrations:** Run production schema migrations and seed system settings.
- [ ] **Environment Variables:** Securely deploy production `.env` file outside web root (`/home/username/.env`).
- [ ] **File Permissions:** Enforce directory permissions (`755`) and file permissions (`644`) to block unauthorized writes.
- [ ] **Cron Jobs:** Configure cPanel cron for queue processing, VTU retries, and hourly payment reconciliation.
- [ ] **SMTP Email Delivery:** Test outbound transactional emails via `info@hambaktech.com.ng` (SPF, DKIM, DMARC configured).
- [ ] **Payment Gateway Production Keys:** Switch Paystack and Flutterwave from test mode to live production keys.
- [ ] **Identity & Telecom API Credentials:** Configure verified production API keys for NIMC and VTU upstream vendors.
- [ ] **Automated Backups:** Configure automated daily cPanel database dumps and weekly off-site file backups.
- [ ] **Application Logging:** Ensure PHP error logs and audit logs write to a protected directory outside `public_html`.
- [ ] **Performance & Monitoring:** Set up uptime monitoring (e.g. UptimeRobot) and verify Gzip/Brotli compression.
- [ ] **End-to-End Production Testing:** Execute end-to-end user checkout, topup, and service submission tests with live cards.
- [ ] **Credential Rotation Policy:** Document 90-day credential rotation schedule for database and gateway tokens.
