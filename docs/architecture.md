# HambakTech Smart Digital Platform — System Architecture

**Document Status:** PLANNED & BASELINE ESTABLISHED  
**Date:** Milestone 1 — Foundation Audit  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. High-Level Architecture Overview

The HambakTech Smart Digital Platform is designed to support a multi-service business ecosystem serving individual customers, students, and corporate clients in Nigeria, with future multi-regional expansion capacity.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|   +-----------------------+  +--------------------+  +--------------+   |
|   | Public Web / Portal   |  | Mobile App (Future)|  | Admin Portal |   |
|   | (Next.js / React)     |  | (React Native/PWA) |  | (Web Portal) |   |
|   +-----------+-----------+  +---------+----------+  +-------+------+   |
+---------------|------------------------|---------------------|----------+
                |                        |                     |
                +------------------------+---------------------+
                                         |
                                         v HTTPS JSON
+-------------------------------------------------------------------------+
|                             API GATEWAY LAYER                           |
|                                                                         |
|                          PHP 8.x RESTful API                            |
|             (Hosted on cPanel Apache with mod_rewrite)                  |
|                                                                         |
|  +---------------------+  +---------------------+  +-----------------+  |
|  | Auth & Session (JWT)|  | Service Dispatcher  |  | Rate Limiting   |  |
|  +---------------------+  +---------------------+  +-----------------+  |
+----------------------------------------+--------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------+
|                        BUSINESS & INTEGRATION SERVICES                  |
|                                                                         |
|  +-------------------+  +-------------------+  +---------------------+  |
|  | Wallet & Ledger   |  | Payment Adapters  |  | Identity Adapters   |  |
|  | (Double Entry)    |  | (Paystack/Flutter)|  | (NIN / BVN / CAC)   |  |
|  +-------------------+  +-------------------+  +---------------------+  |
|  | Telecom VTU Engine|  | Academy Manager   |  | Order & Shop Engine |  |
|  | (Airtime / Data)  |  | (Courses / Certs) |  | (Delivery & Fees)   |  |
|  +-------------------+  +-------------------+  +---------------------+  |
+----------------------------------------+--------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------+
|                            PERSISTENCE LAYER                            |
|                                                                         |
|                   MySQL / MariaDB Relational Database                   |
|                        (Hosted on cPanel Shared)                        |
|                                                                         |
|   - InnoDB Storage Engine                                               |
|   - UTF8mb4 Character Collation                                         |
|   - ACID Transactions for Ledgers and Wallets                           |
+-------------------------------------------------------------------------+
```

---

## 2. Component Layer Responsibilities

### 2.1 Frontend Client (Next.js 16 + Tailwind CSS v4)
- **Role:** Delivers a lightning-fast, SEO-optimized public website and interactive portal for customers and students.
- **State Management:** Clean React hooks, localized form states, and typed API clients.
- **Client Strategy:** Single unified code repository for public marketing and authenticated client dashboards.
- **Status:** BASELINE ACTIVE (Template in audit; business views PLANNED).

### 2.2 Backend Service (PHP REST API)
- **Role:** Centralized business logic, transaction processing, webhook consumption, and role-based access control (RBAC).
- **Communication:** Standardized JSON over HTTPS with Bearer token authentication (JWT / secure session keys).
- **Hosting Target:** cPanel Shared Hosting (Apache with `.htaccess` rewrite rules).
- **Status:** PLANNED (Do NOT implement in Milestone 1).

### 2.3 Persistence Layer (MySQL)
- **Role:** Structured relational data storage with foreign-key referential integrity and strict transaction boundaries.
- **Key Modules:** User accounts, double-entry wallet ledger, orders, courses, identity service logs.
- **Status:** PLANNED (Do NOT create database in Milestone 1).

---

## 3. Hosting & Deployment Strategy (cPanel Shared Hosting)

The production target is **cPanel shared hosting** on `hambaktech.com.ng`. Because shared hosting environments frequently have restrictions on long-running persistent Node.js processes, two architecture pathways are evaluated:

| Pathway | Mechanism | Pros | Considerations |
|---|---|---|---|
| **Option A: Next.js Static Export (`output: 'export'`)** | Compile Next.js to pure static HTML/JS/CSS assets placed in `public_html/`, while all dynamic operations hit `/api/` (PHP). | Zero Node.js daemon overhead, fastest page load, maximum resilience, lowest cPanel resource usage. | Server Components needing on-demand SSR are handled via client fetching. |
| **Option B: cPanel Node.js Application Manager** | Run Next.js server via Phusion Passenger / Node.js manager if cPanel license and host allow. | Native SSR support. | Potential memory limits on shared hosting; process restarts required upon crash. |

*Recommendation:* Baseline development is App Router ready. Once cPanel server specifications are verified during deployment prep, the static export vs Node manager decision will be finalized without rewriting client UI.

---

## 4. Existing Template Audit (Startup Next.js Template)

The repository was initialized from the open-source **Startup Next.js Template** (v2.2.1). Below is the comprehensive classification of all existing files and components:

### 4.1 KEEP (Preserve for Architecture & Foundation)
- `src/app/layout.tsx` & `src/app/providers.tsx` — Next-themes provider, font loader, base wrapper.
- `src/styles/index.css` — Tailwind v4 configuration, `@theme` token definitions, dark mode variants.
- `src/components/Header/ThemeToggler.tsx` — Functional dark/light theme switch.
- `src/components/Common/Breadcrumb.tsx` — Reusable breadcrumb navigation for sub-pages.
- `src/components/Common/SectionTitle.tsx` — Standardized section header with title and description.
- `src/components/Common/ScrollUp.tsx` & `src/components/ScrollToTop/` — Smooth scroll utilities.
- `src/components/Footer/` — Foundational footer layout (will update links & company info in M2).

### 4.2 MODIFY (Adapt for HambakTech in Milestone 2)
- `src/components/Hero/index.tsx` — Replace SaaS copy with HambakTech identity, slogan ("Where Technology Meet Service"), and key service CTAs.
- `src/components/Features/` & `src/types/feature.ts` — Replace generic SaaS feature cards with HambakTech's 12 active business divisions.
- `src/components/Header/menuData.tsx` & `src/components/Header/index.tsx` — Replace template navigation with HambakTech services, academy, contact, and portal links.
- `src/components/About/` — Replace demo text and vectors with HambakTech company background (est. 2020 in Ibeju-Lekki, Lagos) and mission.
- `src/components/Contact/` — Replace demo contact form with authentic HambakTech contact info (phones: `08147837664`, `09019120241`; WhatsApp: `09155104724`; email: `info@hambaktech.com.ng`).
- `src/app/signin/page.tsx` & `src/app/signup/page.tsx` — Adapt layout for HambakTech customer portal authentication.

### 4.3 REMOVED TEMPLATE ASSETS (Completed in Milestone 2)
- `src/components/Pricing/` & `src/components/Pricing/PricingBox.tsx` — Purged. Replaced with transparent, itemized service quotes.
- `src/components/Brands/` — Purged. Removed demo logo SVGs (GrayGrids, TailAdmin, UIdeck, LineIcons).
- `src/components/Video/` — Purged. Removed mock video player modal.
- `src/components/Testimonials/` — Purged. Replaced with genuine standards & governance section (`Trust/index.tsx`) and transparent review collection notice.
- `src/components/Features/` — Purged template features in favor of authoritative `HomeServicesOverview` and `WhyChooseUs`.

### 4.4 OFFICIAL BRANDING & ASSET POLICY
In strict compliance with architectural verification directives:
- **Official Brand Assets Status: PENDING / MISSING FROM REPOSITORY**
  - No approved raster or vector file of the official HambakTech logo has been provided in the workspace repository.
  - No official photographs of the physical office premises have been provided in the workspace repository.
  - Fabricated company imagery, simulated CAC registration certificates, and AI-generated logo approximations have been permanently removed.
- **Replaceable Branding Component Architecture (`BrandLogo.tsx`):**
  - Built as an isolated single source of truth component.
  - When the owner provides the approved official logo file (SVG/PNG), it can be placed in `public/images/brand/` and swapped inside `BrandLogo.tsx` without affecting any page templates or layouts.
- **Physical Office Representation (`OfficePhotoPlaceholder.tsx`):**
  - Renders a clean architectural vector placeholder documenting the address and working hours, with zero fabricated photography.
- **Company Configuration (`src/data/companyConfig.ts`):**
  - Single authoritative repository for company legal name ("Hambaktech & Services"), brand name ("HambakTech"), domain, phone numbers, WhatsApp, physical address (Origanrigan cele Area, Ibeju-Lekki), and operating hours. Ready to be mapped to `CompanySetting` table in database.

---

## 5. Architectural Status Labels

- **CONFIRMED:** Next.js 16 frontend, Tailwind CSS v4, TypeScript, Prisma ORM 6.x configured for MySQL (`provider = "mysql"`), double-entry ledger architecture, centralized singleton database client (`src/lib/db.ts`), deterministic production seed, and type contracts.
- **KNOWN BUT NOT YET VERIFIED:** Exact cPanel database host network latency, remote MySQL port exposure, and SSL certificate auto-renewal.
- **ACTIVE (MILESTONE 3):** Authoritative MySQL schema, Prisma relational domain models, safe decimal Naira precision, idempotent database seed.
- **TRANSITIONAL:** `src/lib/api-client/index.ts` frontend local state simulation (authoritative persistence mapped to MySQL).
- **PLANNED (SUBSEQUENT MILESTONES):** Server-side API endpoints (`/api/*`), live Paystack/Flutterwave payment gateway adapters, telecom switches, NIMC identity APIs, CAC verification automation.

---

## 6. Real Database Architecture & Data Layer (Milestone 3)

In Milestone 3, the authoritative relational data architecture for HambakTech has been established:

```
[ Frontend Client (Next.js 16 App Router) ]
                |
                v (Transitional: API Client / Future: Server API routes)
[ Centralized Database Layer (`src/lib/db.ts`) ]
                |
                v
[ Prisma Client (v6.4.1) ]
                |
                v (InnoDB / UTF8mb4)
[ MySQL Database (Authoritative Source of Truth) ]
```

### Key Architectural Safeguards:
1. **Ledger Integrity:** Zero direct writes to `Wallet.currentBalance` without creating a corresponding immutable `WalletLedgerEntry` record.
2. **Precision Currency:** All price and balance fields use `@db.Decimal(14, 2)` to eliminate floating-point calculation drift.
3. **Database Client Singleton:** Prisma Client is accessed exclusively through `src/lib/db.ts` to prevent connection pooling exhaustion.
4. **PostgreSQL Portability:** Avoided MySQL-only proprietary extensions and primitive array lists so the entire data model can switch to `provider = "postgresql"` in the future without application code redesign.

---

## 7. Unified Mobile & Web API Architecture (Milestone 11)

Milestone 11 establishes the authoritative backend and API engine consumed across Web, Android, and iOS clients:

```
                  HAMBAKTECH AUTHORITATIVE API (/api/v1/*)
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
     Web Portal                 Android App                 iOS App
 (Next.js / Desktop)       (Jetpack Compose / Retrofit) (SwiftUI / URLSession)

  ✓ Same Users          ✓ Same Wallet Ledger         ✓ Same Orders
  ✓ Same Payments       ✓ Same Services              ✓ Same Dynamic Pricing
  ✓ Same Academy        ✓ Same Shop Inventory        ✓ Zero Duplicated Logic
```

### 7.1 Authoritative Principles:
1. **Zero Client Trust:** Mobile clients, browsers, and webviews are untrusted execution environments. Prices, order totals, discount tiers, ledger balances, and payment verification are strictly calculated and stored on the server.
2. **Standardized Authorization:** Both Web (via HTTP-only cookies) and Mobile clients (via `Authorization: Bearer <token>` headers) use the identical authoritative session validation engine (`src/lib/auth.ts` and `src/lib/auth-service.ts`).
3. **Double-Entry Wallet Persistence:** The financial ledger records every transaction with `balanceAfter` snapshots. Wallet balances synchronize in real-time across Web and Mobile devices.
4. **Interactive Development Console:** `/api-docs` provides an interactive testing console for mobile app developers to execute live requests, verify payloads, and generate ready-to-use cURL, Kotlin, and Swift networking code.
5. **Machine-Readable API Contract:** `/api/v1/openapi.json` publishes the official OpenAPI 3.0.3 specification for automated client generation and contract testing.


