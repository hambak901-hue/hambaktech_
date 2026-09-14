# HambakTech Smart Digital Platform — Release Notes

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
