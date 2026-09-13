# HambakTech Smart Digital Platform

> **Where Technology Meet Service**

**Legal Entity:** Hambaktech & Services (CAC Registered)  
**Brand Name:** HambakTech  
**Repository:** `hambaktech_`  
**Official Domain:** [hambaktech.com.ng](https://hambaktech.com.ng)  
**Established:** 2020 (Ibeju-Lekki / Lekki LCDA, Lagos State, Nigeria)  
**Status:** Milestone 1 — Foundation Audit Complete  

---

## 📖 Overview

The **HambakTech Smart Digital Platform** is an all-in-one digital ecosystem powering comprehensive commercial services, identity solutions, educational training, and e-commerce for Ibeju-Lekki, Lagos, and throughout Nigeria.

### Major Platform Areas
- 🌐 **Public Website & Services Portal:** High-performance responsive showcase for all 14 business divisions.
- 👤 **Customer Platform & Dashboard:** Order tracking, digital document downloads, service requests, and receipts.
- 💳 **Payments & Multi-Currency Wallet:** Double-entry wallet ledger and secure gateway integrations (Paystack, Flutterwave, Moniepoint).
- 🆔 **NIN, BVN & CAC Processing:** Certified national identity verification, modification, slip reprinting, and business registration.
- 📱 **Telecom VTU Services:** Automated instant airtime, internet data bundles, and utility bill settlements.
- 🎓 **Academy / Computer Institute:** Course curriculum, student enrollment, training modules, and verifiable digital certificates.
- 🛍️ **Stationery & Bookshop:** Digital catalog of school/office supplies and computer peripherals with distance-based delivery.
- 🖨️ **Graphics & Printing Press:** Digital asset ordering, flex banner production, DI printing, and corporate branding.
- 🛠️ **Administrative Command Center:** Back-office portal for staff processing, financial auditing, and CMS management.
- 📲 **Mobile API Engine:** Unified RESTful API powering web, future mobile apps, and partner integrations.

---

## 🏗️ Technology Architecture

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend (Planned):** PHP 8.x RESTful API (Layered Service Architecture & Provider Adapters)
- **Database (Planned):** MySQL / MariaDB (InnoDB, utf8mb4 encoding, ACID transactions)
- **Production Hosting:** cPanel Shared Hosting (Apache with `.htaccess` rewrites, AutoSSL)
- **Testing & Verification:** ESLint, TypeScript compiler, production build pipeline

---

## 🔄 Development Methodology

Every task and milestone in HambakTech follows a strict engineering cycle:

```
[ BUILD ] ──> [ TEST ] ──> [ FIX ] ──> [ COMMIT ] ──> [ PUSH ] ──> [ DOCUMENT ] ──> [ CONTINUE ]
```

- **Scope Discipline:** Strict adherence to owner specifications; zero premature or unsolicited feature bloat.
- **Milestone Gate:** A milestone must reach 100% verification before the next begins.
- **Zero Committed Secrets:** Credentials are exclusively managed in server environments, never in version control.

---

## 🚀 Getting Started (Development)

### 1. Prerequisites
- Node.js ≥ 20
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```
*(Fill in local configuration values if needed. Do NOT commit `.env.local`)*

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Lint & Build Verification
```bash
npm run lint
npm run build
```

---

## 📚 Project Documentation

All architectural specifications, database models, and deployment guides are available in the `/docs` directory:
- [`docs/project-progress.md`](./docs/project-progress.md) — Current milestone status & audit report
- [`docs/architecture.md`](./docs/architecture.md) — System topology & cPanel hosting plan
- [`docs/database.md`](./docs/database.md) — Planned MySQL database schema domains
- [`docs/api.md`](./docs/api.md) — REST API architecture & provider adapter patterns
- [`docs/deployment.md`](./docs/deployment.md) — cPanel production checklist & SSL
- [`docs/coding-standards.md`](./docs/coding-standards.md) — 20 core engineering rules
- [`docs/roadmap.md`](./docs/roadmap.md) — 14 business divisions & roadmap
- [`docs/release-notes.md`](./docs/release-notes.md) — Release notes & version tracking

---

## 📞 Official Contact & Channels

- **Official Email:** info@hambaktech.com.ng
- **Support Email:** support@hambaktech.com.ng
- **Official Phones:** 08147837664, 09019120241
- **Alternative Phone:** 09127469686
- **Official WhatsApp:** 09155104724
- **Social Handles:** @hambaktech.com.ng (Facebook, Instagram, TikTok, X, LinkedIn, YouTube, Telegram, WhatsApp)
