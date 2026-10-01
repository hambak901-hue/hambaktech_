# HambakTech Smart Digital Platform — Release Notes

---

## Version 0.5.0-user-mgmt (Milestone 4 — User & Customer Management Integration & Closure)

**Release Date:** Milestone 4 Closure Audit  
**Target Environment:** Authoritative PHP REST API + Next.js App Router  
**Status:** MILESTONE 4 COMPLETE — 100% PASSING (41/41 M4 TESTS, 411+ TOTAL PLATFORM TESTS)

### What is Included in Milestone 4:
1. **Customer Dashboard & Profile Experience (`/dashboard/*`):**
   - Full customer profile editing with validation on first name, last name, phone, address, state, LGA.
   - Strict mass-assignment protection rejecting client attempts to overwrite roles, tiers, or status.
   - Dedicated password change modal with current-password verification and automatic session revocation across all other devices.
   - Email update workflow marking accounts unverified until confirmed.
   - Security activity log showing device, IP, and timestamp telemetry.
2. **Customer Identity & KYC Tier Submission (`/dashboard/kyc`):**
   - Tier 0 to Tier 3 compliance flow with government ID verification (NIN/BVN).
   - Secure PII storage masking (storing only last 4 digits `bvn_last4`, `nin_last4`).
   - Dynamic status transitions: `UNVERIFIED` → `PENDING` → `VERIFIED` or `REJECTED`.
3. **Administrative 360 Customer Directory (`/admin/users`):**
   - Comprehensive customer search by name, email, or phone.
   - Role and account status filters with server-side pagination.
   - 360 customer profile modal with live wallet balance visibility and tier management.
   - Account status suspension control with immediate session invalidation.
   - Administrative KYC approval and rejection review workflow.
4. **Security & Guardrail Invariants:**
   - Root super-admin (`hambak901@gmail.com`) is immutably protected from suspension, deactivation, or demotion.
   - Non-super-admins strictly blocked from escalating privileges or assigning the `super_admin` role.
   - Strict customer/admin data isolation (IDOR defense) ensuring users cannot inspect or mutate other accounts.
   - Complete audit trail logging for all sensitive user and administrative actions.
5. **Quality & Test Verifications:**
   - Dedicated M4 test suite (`scripts/test-m4-user-management.ts`): 41/41 PASSED (100%).
   - Total platform tests passing: 411+ across 8 suites with 0 failures.
   - Canonical schema reconciliation: 39/39 tables match with 100% parity.
   - Next.js production build: 73 static pages rendered cleanly, 0 errors.

---

## Version 0.4.0-auth-closure (Milestone 3 — Authentication & Authorization Final Closure Audit)

**Release Date:** Milestone 3 Closure Audit  
**Target Environment:** Authoritative PHP REST API + Next.js App Router  
**Status:** M3 LOCALLY COMPLETE — EXTERNAL/ENVIRONMENTAL VERIFICATION PENDING  

### What is Included in Milestone 3 Closure:
1. **Dedicated M3 Test Suite (`scripts/test-m3-auth.ts`):**
   - 77/77 passed test assertions spanning 12 security groups.
2. **Regression Test Suite (`scripts/test-m4-auth.ts`):**
   - 37/37 passed test assertions.
3. **Cryptographic Standards:**
   - Production password hashing utilizes **Argon2id** (`PASSWORD_ARGON2ID`, 64MB memory cost) in PHP `Security.php`.
   - TypeScript PBKDF2 serves strictly as a development/test compatibility path.
   - Zero plaintext password storage across all code paths.
   - All session, email verification, and password reset tokens stored strictly as SHA-256 digests.
4. **Browser Security:**
   - Zero authoritative authentication tokens persisted in `localStorage` or `sessionStorage`.
   - Production cookies configured with `HttpOnly`, `SameSite=Lax`, and `Secure`.
5. **Environmental Audit Transparency:**
   - Local validation: `npm run build` (PASS), `npx tsc --noEmit` (PASS), `npm run lint` (PASS).
   - PHP CLI and Truehost live remote MySQL limitations documented transparently.


## Version 0.12.0-database-migration (Milestone 1 — Truehost Database Reconciliation & Safe Migration)

**Release Date:** Current Milestone 1 Execution  
**Target Environment:** Truehost cPanel MySQL 8.0+ / MariaDB 10.4+  
**Status:** 100% REBUILT, VERIFIED NON-DESTRUCTIVE & CANONICALLY COMPLIANT  

### What is Included in Milestone 1 Database Migration Rebuild:
1. **Rebuilt `database/reconciliation_and_compat.sql`:**
   - **Zero Destructive Commands**: Completely eliminated risk to live production data (0 `DROP`, 0 `TRUNCATE`, 0 `DELETE`).
   - **Full Canonical Parity**: Defines all 39 tables specified in `database/schema.sql` via `CREATE TABLE IF NOT EXISTS`.
   - **Dynamic Information Schema Guards**: Uses dynamic SQL statements to inspect table and column existence (`Role`, `User`, `UserProfile`, `Wallet`, `WalletLedgerEntry`, `Transaction`, `ServiceCategory`, `Service`, `Order`, `OrderItem`, `OrderStatusHistory`, `Course`, `CourseModule`, `CourseEnrollment`, `Certificate`, `NINRequest`, `CACRequest`, `SupportTicket`, `TicketMessage`).
   - **Financial Data Integrity**: Safely maps `currentBalance` to `balance`, preserves ledger history with unique references, avoids artificial floating-point or currency division errors.
   - **Foreign Key Safety**: Toggles `FOREIGN_KEY_CHECKS = 0` during structure initialization and data synchronization, seeds prerequisite baseline roles and permissions, and restores `FOREIGN_KEY_CHECKS = 1`.
   - **Read-Only Verification Report**: Appends diagnostic queries reporting table counts, wallet balance sums, transaction volume, and zero-orphan integrity checks.
2. **Automated Static Verification Suite (`scripts/verify-reconciliation-sql.ts`):**
   - Statically verifies non-destructiveness, table parity across all 39 tables, foreign key safety toggling, and information_schema guards.
   - 100% passing automated static test suite.

---

## Version 0.11.0-mobile-api (Milestone 11 — Unified Authoritative Mobile API Engine)

**Release Date:** Milestone 11 Execution  
**Target Environment:** Multi-Client Production API (`/api/v1/*`) serving Web, Android, and iOS  
**Status:** MILESTONE 11 100% COMPLETE & VERIFIED  

### What is Included in Milestone 11:
1. **Unified Authoritative Backend Architecture:**
   - Single authoritative backend serving Web, Android, and iOS clients without creating separate mobile backends.
   - Zero duplicated business logic across clients (same users, same wallet ledger, same orders, same payments, same services, same pricing rules).
2. **Strict Server-Side Security & Zero Client Trust:**
   - Client-supplied prices, totals, balances, and roles are never trusted. All computations occur on the server.
   - Unified authentication supports `Authorization: Bearer <session_token>` header for native mobile SDKs (OkHttp, Retrofit, URLSession, Alamofire) as well as secure HTTP-only session cookies for Web browsers.
3. **Complete RESTful API v1 Route Matrix (`/api/v1/*`):**
   - **Authentication:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`.
   - **User Profile:** `GET /user/profile`, `PATCH /user/profile`, `POST /user/password`.
   - **Authoritative Wallet:** `GET /wallet`, `GET /wallet/transactions` (paginated), `POST /wallet/fund`.
   - **Orders & Fulfillment:** `GET /orders`, `POST /orders`, `GET /orders/:id` (with user ownership authorization).
   - **Payments Engine:** `GET /payments/gateways`, `POST /payments/initialize`, `POST /payments/verify`.
   - **Services & Dynamic Pricing:** `GET /services`, `GET /services/categories`, `GET /services/:slug`, `POST /services/calculate-price`.
   - **Academy & Training:** `GET /academy/courses`, `GET /academy/courses/:id`, `POST /academy/enroll` (with authoritative wallet deduction), `GET /academy/enrollments`, `GET /academy/certificates`, `GET /academy/id-cards`.
   - **Shop & Commerce:** `GET /shop/products`, `GET /shop/products/:id`, `GET /shop/categories`, `GET /shop/delivery-zones`, `POST /shop/orders`.
   - **Notifications:** `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`.
   - **System & Metadata:** `GET /system/config` (mobile config, min versions, support), `GET /system/health` (uptime, DB connectivity).
4. **Machine-Readable OpenAPI Specification:**
   - Published `/api/v1/openapi.json` adhering to OpenAPI 3.0.3 specification with comprehensive schemas, parameter types, and bearer auth declarations for native mobile code generation.
5. **Interactive Mobile API Console & Code Generators:**
   - Implemented `/api-docs` testing console with live execution runner, Bearer token manager, and instant cURL, Android Kotlin (OkHttp), and iOS Swift (URLSession) client code snippet generators.
6. **Code Quality & Verification:**
   - 0 ESLint errors (`npm run lint`).
   - 0 TypeScript / compilation errors (`npm run build`).

---

## Version 0.3.0-database (Milestone 3 — Real Database & Data Architecture)

**Release Date:** Milestone 3 Execution  
**Target Environment:** Authoritative Relational Database Architecture (MySQL)  
**Status:** MILESTONE 3 100% COMPLETE & VERIFIED  

### What is Included in Milestone 3:
1. **MySQL Provider & Relational Architecture:**
   - Switched Prisma ORM engine to `provider = "mysql"`.
   - Designed 18 comprehensive domain models with foreign keys, index optimizations, and cascade policies.
   - Preserved 100% PostgreSQL schema portability by avoiding MySQL-only proprietary datatypes and primitive arrays.
2. **Double-Entry Financial Ledger & Monetary Integrity:**
   - Implemented `WalletLedgerEntry` ensuring every balance change has an immutable debit/credit record with before/after state.
   - Standardized all monetary figures to `@db.Decimal(14, 2)` eliminating floating-point calculation drift.
3. **Database Client Singleton:**
   - Unified database access via `src/lib/db.ts` with lazy initialization and production connection safeguards.
4. **Deterministic & Idempotent Seed (`prisma/seed.ts`):**
   - Seed scripts populate 6 roles, 15 permissions, company and system settings, headquarters branch schedules, 8 service categories, 12 core services, tiered pricing rules (`STANDARD`, `AGENT`, `CORPORATE`), upstream provider sandbox configs, and academy curriculum modules.
   - Completely idempotent: running repeatedly does not create duplicate entries.
5. **Transitional State Clarification:**
   - Documented `localStorage` in `src/lib/api-client/index.ts` as transitional mock state for UI simulation, with MySQL established as the single authoritative future source of truth.
6. **Zero Secrets Stored:**
   - No production secrets, database credentials, or private API keys stored in codebase or seed scripts.

---

## Version 0.2.0-website (Milestone 2 Completion & Blocker Resolution)

**Release Date:** Milestone 2 Final Sign-off  
**Target Environment:** Public Web Application (`hambaktech.com.ng`)  
**Status:** MILESTONE 2 100% COMPLETE & VERIFIED  

### What is Included in Milestone 2:
1. **Public Web Experience:**
   - Homepage (`/`) with Hero, 9-Category Services Overview, Why Choose Us, 6-Step Workflow, Platform Roadmap Preview, Academy Highlight, Physical Business Centre Showcase, Trust & Standards, FAQ Accordion, and Contact CTA.
   - Comprehensive Services Directory (`/services`) and 8 dedicated service pages.
   - HambakTech Academy Portal (`/academy`) with 4 complete curriculums, practical lab breakdown, and inquiry flow.
   - About Page (`/about`) detailing dual physical-digital business model and corporate mission.
   - Contact Desk (`/contact`) with interactive inquiry form, physical address, and working hours.
   - Blog & Guides (`/blog`, `/blog-details`, `/blog-sidebar`).
   - Customer Portal Onboarding Layouts (`/signin`, `/signup`).

2. **Final Blocker Resolution Pass (18 Criteria Enforced):**
   - **Official Branding Isolation:** Documented missing official brand logo asset. Retained isolated, replaceable `BrandLogo.tsx` component without claiming it is the approved official logo file.
   - **Zero Fabricated Assets:** Permanently purged fabricated office graphics, simulated CAC certificates, and AI-generated logo approximations.
   - **Accreditation & Certification Language Cleaned:** Revised all claims across academy and services to factual statements ("practical ICT skills training", "Certificate of Completion", "designated identity processing channels").
   - **Early Access Flow:** Bound portal notice button directly to `/contact?service=general` to avoid fake interaction states.
   - **Guarantees & Statistics Audited:** Removed unverified spam-guarantee and percentage metrics.
   - **Template Remnants Purged:** Completely deleted `Brands`, `Pricing`, `Features`, `Video`, and `Testimonials` template directories.
   - **Centralized Company Configuration:** Established `src/data/companyConfig.ts` reflecting `prisma/seed.ts` as the single authoritative source of truth across all components.
   - **Route Integrity:** Fixed all legacy links (including removing `/pricing` from navigation and sidebars).

---

## Version 0.1.0-foundation (Milestone 1 Baseline)

**Release Date:** Milestone 1 Execution  
**Target Environment:** Development & Architecture Baseline  
**Status:** TECHNICAL FOUNDATION COMPLETE — PRE-PRODUCTION  

### What is Included in this Baseline:
1. **Repository Structure Audit:**
   - Completed comprehensive audit of Next.js App Router codebase, components, configuration, and dependencies.
   - Identified base template heritage (`Startup - Free Next.js Startup Website Template` v2.2.1 by NextJSTemplates).
   - Categorized all existing template components into KEEP, MODIFY, REMOVE LATER, and CREATE LATER.

2. **Documentation System Established:**
   - Authored 8 core engineering specifications in `/docs`:
     - `docs/project-progress.md` (Milestone progress tracking and 100% completion checklist)
     - `docs/architecture.md` (High-level system topology and cPanel shared hosting strategy)
     - `docs/database.md` (Planned MySQL schemas for wallets, orders, academy, and identity)
     - `docs/api.md` (REST API architecture, payment verification flow, and provider adapter interfaces)
     - `docs/deployment.md` (cPanel deployment requirements, AutoSSL, and checklist)
     - `docs/coding-standards.md` (The 20 golden engineering rules and TypeScript guidelines)
     - `docs/roadmap.md` (14 business divisions and multi-phase implementation plan)
     - `docs/release-notes.md` (Changelog and version tracking)

3. **Configuration & Safety Baseline:**
   - Git repository initialized and connected to remote `https://github.com/hambak901-hue/hambaktech_.git`.
   - Successful push to GitHub completed by owner via AI Studio Git integration on branch `main`.
   - Local working branch switched to track `origin/main`.
   - Project name updated to `hambaktech` (v0.1.0) in `package.json`.
   - Next.js 16 / ESLint 9 lint script compatibility established (`npm run lint` passing with 0 errors).
   - Production compilation verified (`npm run build` passing with 0 errors).
   - Application metadata (`metadata.json`) declared with official brand name and slogan.
   - `.env.example` created with secure placeholders for all future gateway and database integrations.
   - `.gitignore` hardened to block accidental staging of any secret environment files.

4. **Brand Architecture & Asset Baseline:**
   - Isolated brand component suite (`BrandLogo.tsx`, `OfficePhotoPlaceholder.tsx`).
   - Favicon asset in `public/images/brand/favicon/hambaktech-favicon.svg`.
   - Documented company physical location in Origanrigan cele Area, Lagos.
   - Verified Corporate Affairs Commission legal registration status factually without public exposure of sensitive identifiers.

### Explicit Non-Claims:
- **NOT Production Ready:** This milestone establishes the architectural foundation only.
- **NO Payment Gateway Live:** Paystack, Flutterwave, and Remita are designed in architecture only.
- **NO Identity Integrations Active:** NIN, BVN, and CAC forms are not yet active.
- **NO Mobile Build Deployed:** Native mobile applications and standalone PWA manifests are scheduled for Milestone 10.


## Milestone 5 — Wallet & Financial Foundation

- Added authoritative two-phase wallet funding.
- Added payment provider adapter architecture and webhook verification.
- Added fixed-point wallet arithmetic and reconciliation.
- Added customer funding verification flow and admin wallet governance.
- Local verification is complete; live PHP/Truehost/provider verification remains pending.

## Milestone 7 — Provider Integrations (Veripine, VTpass, VTU.ng)

- Integrated Veripine identity adapter for NIN & BVN verification operations.
- Added unified telecom adapter architecture supporting VTpass and VTU.ng.
- Added resilient webhook processing with HMAC signature validation and replay protection.
- Enforced strict credential isolation: zero provider secrets in client code or browser bundles.
