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

### 4.3 REMOVE LATER (Safely Defer Deletion Until Replaced)
- `src/components/Pricing/` & `src/components/Pricing/PricingBox.tsx` — Template contains hardcoded mock SaaS tiers ($40/mo, etc.) that do not match HambakTech's pay-per-service model.
- `src/components/Brands/` — Template contains demo logo SVGs (GrayGrids, TailAdmin, UIdeck, LineIcons). Replace with real client/partner representations or remove.
- `src/components/Video/` & `src/components/video-modal.tsx` — Template contains mock video player modal with placeholder image.
- `src/components/Testimonials/` — Template contains mock tech startup testimonials. Replace with real verified HambakTech customer reviews.
- `public/images/blog/*` & `src/components/Blog/*` — Template contains placeholder blog articles on SaaS UI design. Replace with HambakTech news and tech tutorials.

### 4.4 CREATE LATER (New Modules in Future Milestones)
- **Services Catalog Module (M2/M6):** Dedicated views for CAC, NIN/BVN, Printing, Graphics, and VTU.
- **Customer Portal (M4):** Orders, receipts, active tickets, and transaction history.
- **Wallet & Ledger Engine (M5):** Balance display, top-up modal, and payment status verification.
- **Academy Module (M7):** Computer institute course catalog, enrollment form, syllabus, and certificate verification.
- **Stationery & Shop (M8):** Bookshop items, cart, distance fee calculation, and order tracking.
- **Admin Management Portal (M9):** Internal dashboard for HambakTech staff to process orders and update pricing.
- **PHP REST Backend (M12):** `/api` directory containing controllers, middleware, and database models.

### 4.5 Official Brand Identity & Asset Architecture
The authoritative brand identity established by the owner has been audited and cataloged in the repository:
- **Logo Hierarchy (`public/images/brand/logo/`):**
  - `hambaktech-logo.svg`: Primary vector brand logo combining the copper segmented circular ring, the stylized "H" and "B" monogram, and Cooper Black brand typography ("HAMBAK — Tech & Services").
  - `hambaktech-logo-light.svg`: Version optimized for high-contrast light backgrounds with solid dark typography.
  - `hambaktech-logo-dark.svg`: Version optimized for dark backgrounds with crisp white typography.
  - `hambaktech-mark.svg`: Standalone emblem mark for icons, navigation badges, and compact cards.
- **Favicon Hierarchy (`public/images/brand/favicon/`):**
  - `hambaktech-favicon.svg`: Monogram and segmented ring scaled for browser tab favicons and PWA icons.
- **Physical Premises Verification (`public/images/brand/office/`):**
  - `hambaktech-office.svg`: Vector architectural reference documenting the authentic HambakTech physical premises (Origanrigan cele Area, Lagos), including the overhead "HAMBAK TECH & SERVICES" signboard, Business Center printing and NIN registration desk, Game Center console lounge (FIFA 23 screens), and Computer Institute student workstation laboratory.
- **Corporate Registration Record (`public/images/brand/cac/`):**
  - `cac-certificate.svg`: Vector record documenting official Corporate Affairs Commission Registration No. `9284726` and TIN `2622495414483` under CAMA 2020.
- **Template Legacy (`public/images/logo/`):**
  - `logo.svg` & `logo-2.svg`: Startup template assets retained temporarily for rollback safety, but strictly superseded by `public/images/brand/` in all user-facing layouts.

---

## 5. Architectural Status Labels

- **CONFIRMED:** Next.js 16 frontend, Tailwind CSS v4, TypeScript, Git workflow, official brand colors, and company information.
- **KNOWN BUT NOT YET VERIFIED:** Exact cPanel PHP version, database user privileges, and SSL auto-renewal status on the hosting server.
- **PLANNED:** PHP REST API, MySQL database schemas, Paystack/Flutterwave/Remita adapters, NIN/BVN providers.
- **NOT IMPLEMENTED:** All business features (deliberately preserved for future milestones).
