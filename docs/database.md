# HambakTech Smart Digital Platform — Database Architecture & Data Model

**Database Technology:** MySQL (InnoDB Storage Engine, UTF8mb4 Unicode)  
**ORM & Migration Tooling:** Prisma ORM 6.x (`provider = "mysql"`)  
**Status:** MILESTONE 3 — REAL DATABASE & DATA ARCHITECTURE COMPLETE  
**Portability:** Fully portable to PostgreSQL without schema redesign  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. Architectural Principles

1. **MySQL Provider & PostgreSQL Portability:**  
   The authoritative schema is configured for MySQL (`provider = "mysql"`). All primary keys utilize standard UUID strings, all foreign keys enforce strict referential constraints (`ON DELETE RESTRICT` for financial and ledger records; `ON DELETE CASCADE` for parent-child aggregates), and all monetary amounts are modeled as `Decimal(14, 2)`. Primitive array types are deliberately avoided to maintain full compatibility across MySQL and PostgreSQL.

2. **Immutable Double-Entry Financial Ledger:**  
   Wallet balances cannot be manipulated by arbitrary arithmetic. Every balance adjustment generates an immutable `WalletLedgerEntry` recording `balanceBefore`, `balanceAfter`, `amount`, `referenceType` (`WALLET_FUNDING`, `SERVICE_PURCHASE`, `REFUND`, `REVERSAL`, `ADJUSTMENT`), and `referenceId`.

3. **Safe Monetary Arithmetic:**  
   All monetary fields (`basePrice`, `providerCost`, `markupAmount`, `sellingPrice`, `totalAmount`, `currentBalance`, `ledgerBalance`, `lockedBalance`) use `@db.Decimal(14, 2)` or `@db.Decimal(12, 2)`. No floating-point database types (`FLOAT`/`DOUBLE`) or unsafe JavaScript floating-point calculations are permitted.

4. **Separation of Internal Keys & Public Business References:**  
   All internal database records use random UUIDs for relational consistency and security. Customer-facing identifiers are generated as distinct, human-readable business references:
   - Orders: `HT-ORD-YYYY-XXXX`
   - Payments: `HT-PAY-YYYY-XXXX`
   - Transactions: `HT-TXN-YYYY-XXXX`
   - NIN Requests: `HT-NIN-YYYY-XXXX`
   - CAC Requests: `HT-CAC-YYYY-XXXX`
   - Support Tickets: `HT-TKT-YYYY-XXXX`
   - Certificates: `HT-CERT-YYYY-XXXX`
   - Business Center Requests: `HT-BC-YYYY-XXXX`

5. **Nothing Configurable Hardcoded:**  
   All business metadata (pricing rules, customer tier markups, branch addresses, contact details, operational hours, provider timeouts) resides in `company_settings`, `system_settings`, `pricing_rules`, or `branches`.

6. **Transitional Client-Side Store Status:**  
   The existing `src/lib/api-client/index.ts` and `localStorage` state is strictly a transitional UI simulation layer to maintain responsive frontend preview functionality while the authoritative schema and subsequent backend API endpoints are deployed.

---

## 2. Authoritative Domain Schemas

### 2.1 Identity, Access & RBAC
- **`users`**: Core authentication account (`id`, `email`, `phone`, `passwordHash`, `status`, `customerTier`, `roleId`, timestamps).
- **`roles`**: System role definitions (`super_admin`, `admin`, `staff`, `agent`, `customer`, `student`).
- **`permissions`**: Granular platform access nodes (`users.manage`, `services.manage`, `orders.process`, `finance.audit`, `nin.process`, `cac.process`, etc.).
- **`role_permissions`**: Composite many-to-many relationship linking roles to permissions.
- **`user_sessions`**: Server-side token hash persistence, device user-agent tracking, IP recording, and revocation status.

### 2.2 User Profile & KYC Verification
- **`user_profiles`**: Personal profile data (`firstName`, `lastName`, `avatarUrl`, `state`, `lga`, `address`, `nextOfKinName`, `nextOfKinPhone`).
- **KYC Fields**: `kycTier` (`TIER_0` to `TIER_3`), `kycStatus` (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`), `ninVerified`, `bvnVerified`, `idDocumentType`, `idDocumentRef`, `verifiedAt`.

### 2.3 Company Configuration, Settings & Branches
- **`company_settings`**: Public legal and brand attributes (`company_name`, `brand_name`, `slogan`, `official_domain`, `support_email`, `physical_address`, etc.).
- **`system_settings`**: Platform operational controls (`default_currency`, `wallet_min_funding`, `maintenance_mode`, `vtu_auto_retry_attempts`, etc.).
- **`branches`**: Physical business locations (Headquarters in Origanrigan cele Area, Lagos State).
- **`business_hours`**: Scheduled opening and closing times per weekday per branch.

### 2.4 Service Catalog & Delivery Variations
- **`service_categories`**: Service taxonomy (`telecom-vtu`, `identity-verification`, `cac-registration`, `computer-institute`, `business-centre`, `graphics-printing`, `game-centre`, `stationery-accessories`).
- **`services`**: Core service offerings (`slug`, `code`, `name`, `basePrice`, `dynamicPricing`, `status`, `availability`, `turnaroundSLA`, `requiresDocuments`).
- **`service_variants`**: Specific options and bundles (e.g., 1GB data plan, plastic ID laminate).
- **`service_features`**: Structured deliverables, prerequisites, and features per service.

### 2.5 Providers & Health Monitoring
- **`providers`**: Upstream switches (`PAYSTACK`, `FLUTTERWAVE`, `MONIEPOINT`, `NIN_NIMC`, `VTU_AGGREGATOR`).
- **`provider_configs`**: Environment config references (`SANDBOX`, `PRODUCTION`) referencing environment variable keys rather than raw credentials.
- **`provider_services`**: Mapping between HambakTech services and provider switch codes, costs, and priority order.
- **`provider_health`**: Real-time heartbeat logs, latency monitoring (`latencyMs`), and success rate analytics (`successRate`).

### 2.6 Dynamic Pricing Engine & Customer Tiers
- **`pricing_rules`**: Configurable rules (`MARKUP_FLAT`, `MARKUP_PERCENTAGE`, `DISCOUNT_FLAT`, `COMMISSION`) applicable to tiers (`STANDARD`, `AGENT`, `CORPORATE`).
- **`service_prices`**: Pre-calculated selling prices combining provider wholesale cost and tier markup.

### 2.7 Orders & Fulfillment History
- **`orders`**: Master order record (`orderNumber`, `userId`, `status`, `paymentStatus`, `deliveryType`, `subtotalAmount`, `feeAmount`, `totalAmount`).
- **`order_items`**: Relational line items referencing services, variants, unit prices, and quantities.
- **`order_status_history`**: Audit trail of every lifecycle transition (`PENDING` → `PROCESSING` → `COMPLETED` / `CANCELLED`).

### 2.8 Wallets & Financial Ledger
- **`wallets`**: User balances (`currentBalance`, `ledgerBalance`, `lockedBalance`, `status`).
- **`wallet_ledger_entries`**: Immutable ledger with strict credit/debit tracking, running balance balances, and reference links.

### 2.9 Payments & Webhook Idempotency
- **`payments`**: Payment records (`paymentRef`, `channel`, `amount`, `status`, `providerRef`, `paidAt`).
- **`payment_webhook_events`**: Idempotent gateway webhook storage (`gateway`, `event`, `idempotencyKey`, `payload`, `signature`, `isProcessed`).

### 2.10 Transactions
- **`transactions`**: High-performance transaction history for customer dashboards and admin reconciliation.

### 2.11 Academy & IT Institute
- **`course_categories`**: Academic categories.
- **`courses`**: Curricula (`code`, `title`, `level`, `durationWeeks`, `tuitionFee`, `isCertificateIncluded`).
- **`course_modules`**: Sequential syllabus modules with assigned study hours.
- **`course_enrollments`**: Student progress tracking and cohort allocation.
- **`course_progress`**: Granular per-module completion markers.
- **`certificates`**: Verifiable completion credentials with public cryptographic verification hashes (`verificationHash`).

### 2.12 NIN Centre Desk
- **`nin_requests`**: Identity requests (`trackingNumber`, `serviceType`, `applicantName`, `phone`, `email`, `status`, `deliveryType`, `pickupOffice`).
- **`nin_request_status_history`**: Status progression timeline for applicant tracking.

### 2.13 CAC Corporate Desk
- **`cac_requests`**: Corporate filings (`trackingNumber`, `entityType`, `proposedName1`, `proposedName2`, `natureOfBusiness`, `directorsCount`, `rcNumber`, `tinNumber`).
- **`cac_request_status_history`**: Step-by-step corporate registration audit trail.

### 2.14 Business Centre Desk
- **`business_service_requests`**: Physical document requests (`requestNumber`, `serviceType`, `pagesCount`, `copiesCount`, `colorType`, `paperSize`, `bindingType`, `estimatedCost`).

### 2.15 Support Desk
- **`support_tickets`**: Ticket thread containers (`ticketNumber`, `category`, `subject`, `priority`, `status`).
- **`ticket_messages`**: Chronological conversation messages between clients and support staff.

### 2.16 Notifications
- **`notifications`**: Multi-channel alerts (`IN_APP`, `EMAIL`, `SMS`, `WHATSAPP`).
- **`notification_preferences`**: Granular opt-in/opt-out toggles per user.

### 2.17 Content Management (CMS)
- **`cms_announcements`**: System banners and maintenance notices.
- **`blog_posts`**: Informational articles and platform guides.
- **`cms_pages`**: Static policy, terms, and about pages.
- **`faqs`**: Categorized searchable customer inquiries.

### 2.18 System Audit Ledger
- **`audit_logs`**: Administrative and automated action records (`actorId`, `action`, `entityType`, `entityId`, `ipAddress`, `userAgent`, `beforeState`, `afterState`, `status`).

---

## 3. High-Frequency Query Indexes

To guarantee sub-millisecond lookups under high concurrent traffic:
- **`users`**: Indexes on `roleId`, `email`, `phone`, `status`, `customerTier`.
- **`orders`**: Indexes on `userId`, `orderNumber`, `status`, `paymentStatus`, `createdAt`.
- **`payments`**: Indexes on `userId`, `orderId`, `paymentRef`, `status`, `providerRef`.
- **`wallets`**: Indexes on `userId`, `status`.
- **`wallet_ledger_entries`**: Indexes on `walletId`, `[referenceType, referenceId]`, `createdAt`.
- **`transactions`**: Indexes on `userId`, `reference`, `status`, `type`, `createdAt`.
- **`services`**: Indexes on `categoryId`, `slug`, `status`.
- **`nin_requests`**: Indexes on `trackingNumber`, `userId`, `status`, `serviceType`.
- **`cac_requests`**: Indexes on `trackingNumber`, `userId`, `status`, `entityType`.
- **`support_tickets`**: Indexes on `ticketNumber`, `userId`, `status`, `priority`, `category`.
- **`audit_logs`**: Indexes on `actorId`, `[entityType, entityId]`, `createdAt`.
- **`payment_webhook_events`**: Unique index on `idempotencyKey`; composite on `[gateway, event]`.

---

## 4. Migration & Seeding Verification

- **Schema Validation:** Verified clean via `npx prisma validate`.
- **Client Generation:** Verified clean via `npx prisma generate`.
- **Deterministic Seed:** Safe, idempotent baseline seed in `prisma/seed.ts` populating:
  - 6 system roles
  - 15 core permissions with Super Admin mapping
  - 9 company settings and 6 system operational parameters
  - 1 physical headquarters branch with 7-day business schedules
  - 8 service categories and 12 foundational services
  - Tiered pricing matrix (`STANDARD`, `AGENT`, `CORPORATE`)
  - 5 upstream gateway provider configurations
  - Academy curriculum with 4 foundational IT modules
  - Baseline CMS announcements and categorized FAQs
- **Zero Credentials:** No production credentials, private certificates, API keys, or raw passwords exist in schema or seed definitions.
