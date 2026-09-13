# HambakTech Smart Digital Platform — Database Architecture

**Database Technology:** MySQL / MariaDB (Planned for cPanel Shared Hosting)  
**Status:** ALL SCHEMAS PLANNED — ZERO TABLES IMPLEMENTED IN MILESTONE 1  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. Database Architectural Principles

1. **Relational Integrity:** All cross-domain relationships enforce strict foreign keys (`ON DELETE RESTRICT` for financial and audit logs).
2. **Double-Entry Financial Ledger:** All wallet balances are derived from or strictly balanced by credit/debit ledger entries. No arbitrary balance overwrites.
3. **Database-Driven Business Data:** No service pricing, course fees, distance delivery fees, or contact details shall be hardcoded into frontend components. Everything resides in `settings` or respective service catalog tables.
4. **Auditability:** Every financial transaction, NIN lookup, status change, and administrative action records an immutable audit log entry.
5. **Character Encoding:** All tables use `utf8mb4` encoding with `utf8mb4_unicode_ci` collation for full emoji and international character support.

---

## 2. Planned Domain Schemas (All Marked PLANNED)

The following schema domains represent the planned data model to be implemented in Milestone 12 and utilized across subsequent modules. **None of these tables are created in the repository at this stage.**

### 2.1 Identity, Users & Roles [PLANNED]
- `users`: Core account record (UUID/ID, name, email, phone, password_hash, role_id, status, email_verified_at, created_at, updated_at).
- `roles`: Role definitions (`super_admin`, `admin`, `staff`, `instructor`, `student`, `customer`).
- `permissions`: Granular permission nodes (e.g., `services.nin.process`, `finance.refund`, `academy.enroll`).
- `role_permissions`: Mapping of roles to permissions.
- `user_profiles`: Extended profile details (state, LGA, address, next of kin, emergency contacts).

### 2.2 Wallets & Financial Ledger [PLANNED]
- `wallets`: User wallet summary (user_id, currency, current_balance, ledger_balance, locked_balance, status).
- `wallet_ledger`: Immutable double-entry accounting records (ledger_id, wallet_id, entry_type [DEBIT/CREDIT], amount, balance_after, reference_type, reference_id, description, created_at).
- `wallet_transactions`: User-facing transaction ledger (transaction_ref, user_id, type [TOPUP, PAYMENT, REFUND, TRANSFER], amount, fee, status, provider, gateway_ref).

### 2.3 Payments & Settlements [PLANNED]
- `payments`: Master payment records initiated across all payment channels.
- `payment_attempts`: Individual gateway interaction records (attempt_id, payment_id, gateway [PAYSTACK, FLUTTERWAVE, REMITA, MONIEPOINT], request_payload, response_payload, status).
- `payment_webhooks`: Raw incoming gateway webhook logs (idempotency key, gateway, event, payload, verified_at, processed_at, status).
- `refunds`: Refund tracking, approval state, reason, and wallet/bank credit reference.
- `settlements`: Reconciliation tracking for merchant bank deposits.

### 2.4 Services & Digital Business Centre [PLANNED]
- `services`: Master catalog of HambakTech services (slug, name, division, description, base_price, dynamic_pricing_flag, is_active).
- `service_orders`: Customer orders for services (order_ref, customer_id, service_id, status [PENDING, IN_PROGRESS, AWAITING_DOCS, COMPLETED, CANCELLED], total_price, payment_status).
- `service_attachments`: Customer uploaded files, photos, identification scans.

### 2.5 NIN, BVN & Identity Services [PLANNED]
- `nin_services`: Catalog of NIN service types (e.g., Fresh Enrollment, Modification, Validation, Slip Printing, Plastic ID Card).
- `nin_requests`: Customer requests (tracking_code, user_id, nin_service_type, tracking_id, nin_number_hash, slip_type, status, agent_id, remarks).
- `bvn_requests`: BVN verification and modification logs.
- `cac_requests`: Business name, company registration, and post-incorporation filing requests.

### 2.6 Telecom & VTU Services [PLANNED]
- `telecom_providers`: Configured VTU upstream providers.
- `telecom_plans`: Airtime and data bundle catalog with retail prices and wholesale costs.
- `telecom_transactions`: Execution records (phone_number, network, plan_id, api_response, retry_count, status).

### 2.7 Academy & Computer Institute [PLANNED]
- `courses`: Training programs (title, code, duration_weeks, tuition_fee, syllabus_url, is_active).
- `lessons`: Curriculum modules and lesson materials.
- `students`: Enrolled student records linked to `users`.
- `enrollments`: Course enrollment status, batch, attendance percentage, grade.
- `certificates`: Serialized digital completion certificates with public verification hashes.
- `student_id_cards`: Issued student identity card numbers, barcode/QR code data, and expiry dates.

### 2.8 Shop & Stationery Products [PLANNED]
- `categories`: Bookshop and equipment classifications.
- `products`: Physical goods (SKU, title, description, unit_price, stock_quantity, image_url, weight_kg).
- `orders`: Shop orders, shipping details, distance delivery fee, total.
- `order_items`: Line items with price at purchase time and quantity.

### 2.9 System, CMS, Notifications & Audit [PLANNED]
- `settings`: Key-value configuration table (company phone numbers, emails, addresses, fee overrides, maintenance mode).
- `notifications`: In-app, SMS, and email alerts sent to users.
- `audit_logs`: System audit trail (actor_id, action, ip_address, user_agent, entity_type, entity_id, before_state, after_state, created_at).

---

## 3. Implementation Status Summary

| Area | Status | Implementation Milestone |
|---|---|---|
| Database Engine Selection (MySQL) | CONFIRMED | Milestone 1 (Planned Target) |
| Database Schemas / Tables | NOT IMPLEMENTED | Milestone 12 (Backend Deployment) |
| Test Seed Data | NOT IMPLEMENTED | Milestone 12 (Backend Deployment) |
| Migration Scripts | NOT IMPLEMENTED | Milestone 12 (Backend Deployment) |
