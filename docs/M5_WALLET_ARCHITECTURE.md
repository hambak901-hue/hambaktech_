# HambakTech Smart Digital Platform — Milestone 5 Architecture & Design Specification
## Wallet & Financial Foundation

**Project:** HambakTech Smart Digital Platform  
**Brand:** HambakTech  
**Legal Entity:** Hambaktech & Services (CAC Registered)  
**Slogan:** Where Technology Meet Service  
**Official Domain:** hambaktech.com.ng  
**Milestone:** Milestone 5 — Wallet & Financial Foundation  
**Status:** **ARCHITECTURE SPECIFICATION & DESIGN REVIEW (PRE-IMPLEMENTATION)**  
**Date:** September 2026  
**Architect / Technical Lead:** ChatGPT  
**Implementation Developer:** AI Studio  

---

## 1. Executive Summary & Forensic Audit of Existing API

Milestone 5 establishes the authoritative financial backbone for the HambakTech Smart Digital Platform. This document defines the formal architecture, data contracts, state machines, provider abstractions, and concurrency invariants for all financial operations across the platform.

### 1.1 Forensic Audit Findings on Prepared Codebase

A line-by-line forensic audit of the existing wallet and payment infrastructure across `/php-backend/src/Controllers/WalletController.php`, `/php-backend/src/Services/WalletService.php`, `/php-backend/src/Controllers/AdminController.php`, `/database/schema.sql`, and the Next.js client was performed.

#### Strengths of Existing Preparation:
1. **ACID Transaction & Concurrency Foundation:**
   - `WalletService.php` properly implements `Database::transaction(...)` with `SELECT balance, ledger_balance, status FROM wallets WHERE user_id = ? FOR UPDATE` row-level pessimistic locking.
   - This prevents race conditions and concurrent double-spend attacks during wallet credits and debits.
2. **Double-Entry Ledger Foundation:**
   - Both `credit()` and `debit()` record `balance_before` and `balance_after` in `wallet_ledger` alongside the updated balance on the `wallets` table in the identical database transaction.
3. **Database Schema Readiness:**
   - `database/schema.sql` already defines the 6 core financial tables:
     - `wallets`: User-linked balance container with `DECIMAL(14,2)`, currency, and status (`ACTIVE`, `FROZEN`, `RESTRICTED`).
     - `wallet_ledger`: Immutable append-only audit entries with `type`, `amount`, `balance_before`, `balance_after`, `reference`, `category`.
     - `transactions`: Customer-visible lifecycle records (`WALLET_FUNDING`, `SERVICE_PAYMENT`, etc.) with statuses (`PENDING`, `SUCCESSFUL`, `FAILED`, `REVERSED`).
     - `payments`: Gateway attempt records linking to external providers (`Paystack`, `Flutterwave`, `Moniepoint`).
     - `payment_idempotency`: Deduplication table preventing replay attacks.
     - `payment_webhooks`: Raw webhook payload ingestion ledger for asynchronous reconciliation.
4. **Admin Wallet Control:**
   - `AdminController.php` contains initial implementations for `listWallets()`, `adjustWallet()`, `updateWalletStatus()`, and `listTransactions()`.

#### Critical Gaps & Vulnerabilities to Address in M5:
1. **Critical Security Vulnerability in `WalletController::fund()`:**
   - *Current Implementation:* Accepts `{ amount, description, gateway }` and immediately invokes `WalletService::credit()` to increment the user's live balance directly, without contacting an external payment gateway or requiring payment verification.
   - *Exploit Risk:* Any user or script calling `POST /api/wallet/fund` can credit arbitrary funds to their wallet with zero payment.
   - *Resolution for M5:* Refactor funding into a two-phase flow:
     - Phase 1: `POST /api/wallet/fund/initialize` creates a `PENDING` payment attempt via a provider adapter and returns checkout metadata (authorization URL, reference).
     - Phase 2: Credit occurs **only** upon cryptographic webhook verification (`POST /api/payments/webhook/{provider}`) or authoritative server-side requery (`POST /api/wallet/fund/verify`).
2. **Missing Provider Adapter Abstraction:**
   - The prepared API does not contain gateway integration classes. Payment provider logic is currently absent or hardcoded.
   - *Resolution for M5:* Build a clean `PaymentProviderInterface` with pluggable adapters: `PaystackAdapter`, `FlutterwaveAdapter`, `MoniepointAdapter`, and `BankTransferAdapter`.
3. **Missing Webhook Ingestion & Signature Verification:**
   - No route or handler exists to process inbound webhook events from Paystack (HMAC SHA512) or Flutterwave (secret hash).
   - *Resolution for M5:* Implement `/api/payments/webhook/{provider}` with raw payload signature validation, logging in `payment_webhooks`, and transactional idempotent execution.
4. **Data Property Disconnect between Client and Backend:**
   - Client (`CustomerWalletPage`) expects `data.wallet.currentBalance`, while PHP backend returns `data.balance`.
   - Client expects `data.transactions` as an array, while `WalletController::getLedger()` returns raw ledger entries rather than customer transactions.
   - *Resolution for M5:* Standardize the unified DTO format across customer dashboard, transaction history, and admin views.
5. **Lack of Automated Double-Entry Reconciliation:**
   - No mechanism exists to verify whether `wallet.balance` strictly equals `SUM(credits) - SUM(debits)` or matches the latest `wallet_ledger.balance_after`.
   - *Resolution for M5:* Implement an automated reconciliation service and admin diagnostic endpoint.

---

## 2. Core Architectural Principles & Invariants

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │              CLIENT APPS (Next.js / Mobile)            │
                                      └──────────────────────────┬─────────────────────────────┘
                                                                 │
                                                    REST / Bearer JWT (Zero Trust)
                                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  PHP BACKEND SERVICE                                                   │
│                                                                                                                        │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌──────────────────────────────────────────────┐  │
│  │   WalletController (Auth)   │   │     PaymentsController      │   │            AdminController (RBAC)            │  │
│  └──────────────┬──────────────┘   └──────────────┬──────────────┘   └──────────────────────┬───────────────────────┘  │
│                 │                                 │                                         │                          │
│                 ▼                                 ▼                                         ▼                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                WALLET SERVICE                                                    │  │
│  │  - Row-Level Locking (`SELECT ... FOR UPDATE`)                       - Non-Negative Balance Enforcement           │  │
│  │  - Double-Entry Ledger Bookkeeping                                   - Idempotency & Replay Defense              │  │
│  │  - Transaction Lifecycle Management                                  - Audit Trail Generation                    │  │
│  └───────────────────────┬──────────────────────────────────────────────────────────────────┬───────────────────────┘  │
│                          │                                                                  │                          │
│                          ▼                                                                  ▼                          │
│  ┌─────────────────────────────────────────────┐                    ┌───────────────────────────────────────────────┐  │
│  │          PROVIDER ADAPTER REGISTRY          │                    │             DATABASE TRANSACTION              │  │
│  │  ┌───────────────┐      ┌────────────────┐  │                    │  - `wallets` (Pessimistic Lock)               │  │
│  │  │PaystackAdapter│      │FlutterwaveAdapt│  │                    │  - `wallet_ledger` (Immutable Audit Append)   │  │
│  │  ├───────────────┤      ├────────────────┤  │                    │  - `transactions` (Customer Status Lifecycle) │  │
│  │  │MoniepointAdapt│      │BankTransferAdap│  │                    │  - `payments` (Provider Reference Sync)       │  │
│  │  └───────────────┘      └────────────────┘  │                    │  - `payment_idempotency` (Deduplication)      │  │
│  └───────────────────────┬─────────────────────┘                    └───────────────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────────────────────────────────┬──────────────────────────┘
                           │                                                                  │
                           ▼                                                                  ▼
             External Payment Gateways                                           Authoritative MySQL Database
             (Paystack / Flutterwave)                                                (schema.sql / InnoDB)
```

### 2.1 The Seven Unbreakable Financial Invariants

1. **Zero Client Authority:**
   - The frontend is strictly an interactive view. The client never determines if a payment succeeded, never directly credits or debits a wallet, never mutates transaction statuses, and never computes fee amounts.
2. **Database-Safe Monetary Representation (`DECIMAL(14,2)`):**
   - Floating-point arithmetic is strictly prohibited for monetary values. All currency values are stored as `DECIMAL(14,2)` in MySQL and computed using strict fixed-point arithmetic (`bcmath` or string rounding to 2 decimal places).
3. **ACID Transaction Boundary:**
   - Every financial state change (credit, debit, adjustment, reversal) must execute inside a single atomic database transaction (`Database::transaction()`). A failure at any step causes a complete rollback.
4. **Pessimistic Row-Level Locking (`FOR UPDATE`):**
   - The wallet row must be locked with `SELECT ... FOR UPDATE` before inspecting balances or computing mutations. This prevents concurrent race conditions and double debits.
5. **Immutable Double-Entry Ledger Invariant:**
   - For every balance alteration on `wallets`, exactly one immutable record is inserted into `wallet_ledger`.
   - The mathematical invariant must strictly hold:
     $$\text{balance\_after} = \text{balance\_before} + \text{amount} \quad (\text{for CREDIT})$$
     $$\text{balance\_after} = \text{balance\_before} - \text{amount} \quad (\text{for DEBIT})$$
     $$\text{wallet.balance} \equiv \text{latest\_ledger.balance\_after}$$
6. **Strict Non-Negative Balance Enforcement:**
   - Debits must fail with `Insufficient wallet balance` if $\text{amount} > \text{wallet.balance}$. No negative balances or unauthorized overdrafts are ever permitted.
7. **Strict Idempotency Guarantee:**
   - Every external funding, payment verification, and webhook event must provide or generate a unique reference checked against `payment_idempotency` or unique reference constraints. Replaying an identical webhook or request must return the cached result without duplicate crediting.

---

## 3. Canonical Database Schema Alignment

The authoritative schema defined in `/database/schema.sql` is preserved and fully utilized:

### 3.1 `wallets` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 wallet identifier |
| `user_id` | `VARCHAR(36)` | `NOT NULL UNIQUE, FK(users.id)` | Owner user account (1:1 relation) |
| `balance` | `DECIMAL(14,2)` | `NOT NULL DEFAULT 0.00` | Current spendable balance |
| `ledger_balance` | `DECIMAL(14,2)` | `NOT NULL DEFAULT 0.00` | Settled accounting balance |
| `currency` | `VARCHAR(3)` | `NOT NULL DEFAULT 'NGN'` | ISO currency code (NGN) |
| `status` | `ENUM` | `'ACTIVE', 'FROZEN', 'RESTRICTED'` | Operational state of wallet |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `DATETIME` | `ON UPDATE CURRENT_TIMESTAMP` | Last mutation timestamp |

### 3.2 `wallet_ledger` Table (Immutable Double-Entry Entries)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 ledger entry identifier |
| `wallet_id` | `VARCHAR(36)` | `NOT NULL, FK(wallets.id)` | Parent wallet identifier |
| `transaction_id` | `VARCHAR(36)` | `NULL, FK(transactions.id)` | Associated transaction record |
| `type` | `ENUM` | `'CREDIT', 'DEBIT'` | Entry direction |
| `amount` | `DECIMAL(14,2)` | `NOT NULL` | Positive numerical transaction amount |
| `balance_before` | `DECIMAL(14,2)` | `NOT NULL` | Balance before this operation |
| `balance_after` | `DECIMAL(14,2)` | `NOT NULL` | Balance after this operation |
| `reference` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Unique reference of the ledger entry |
| `category` | `VARCHAR(50)` | `NOT NULL` | Category: `WALLET_FUNDING`, `SERVICE_PURCHASE`, `ADMIN_ADJUSTMENT`, `REVERSAL` |
| `description` | `TEXT` | `NOT NULL` | Human-readable description |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### 3.3 `transactions` Table (Customer-Facing Activity & Lifecycle)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 transaction identifier |
| `user_id` | `VARCHAR(36)` | `NOT NULL, FK(users.id)` | Target user identifier |
| `reference` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Canonical reference (`HT-TX-...`) |
| `type` | `ENUM` | `'WALLET_FUNDING', 'SERVICE_PAYMENT', 'PRODUCT_PURCHASE', 'ACADEMY_ENROLLMENT', 'BILL_PAYMENT', 'REFUND'` | Transaction nature |
| `amount` | `DECIMAL(14,2)` | `NOT NULL` | Principal amount |
| `fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Gateway/platform fee |
| `total_amount` | `DECIMAL(14,2)` | `NOT NULL` | Total debited/credited (`amount + fee`) |
| `currency` | `VARCHAR(3)` | `NOT NULL DEFAULT 'NGN'` | ISO currency code (NGN) |
| `status` | `ENUM` | `'PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED'` | Transaction lifecycle state |
| `channel` | `VARCHAR(50)` | `NOT NULL DEFAULT 'WALLET'` | Gateway: `WALLET`, `PAYSTACK`, `FLUTTERWAVE`, `MONIEPOINT`, `BANK_TRANSFER` |
| `metadata` | `TEXT` | `NULL` | JSON string containing gateway/context payload |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Initial request timestamp |
| `updated_at` | `DATETIME` | `ON UPDATE CURRENT_TIMESTAMP` | Lifecycle change timestamp |

### 3.4 `payments` Table (External Gateway Attempts)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 payment attempt identifier |
| `user_id` | `VARCHAR(36)` | `NOT NULL, FK(users.id)` | Requesting user |
| `transaction_id` | `VARCHAR(36)` | `NULL, FK(transactions.id)` | Associated transaction record |
| `provider` | `VARCHAR(50)` | `NOT NULL` | `PAYSTACK`, `FLUTTERWAVE`, `MONIEPOINT`, `BANK_TRANSFER` |
| `provider_reference` | `VARCHAR(100)` | `NULL` | External transaction ID from provider |
| `reference` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Internal reference (`HT-PAY-...`) |
| `amount` | `DECIMAL(14,2)` | `NOT NULL` | Expected settlement amount |
| `currency` | `VARCHAR(3)` | `NOT NULL DEFAULT 'NGN'` | ISO currency code |
| `status` | `ENUM` | `'PENDING', 'SUCCESSFUL', 'FAILED', 'ABANDONED'` | Gateway settlement status |
| `paid_at` | `DATETIME` | `NULL` | Gateway confirmed payment timestamp |
| `raw_response` | `TEXT` | `NULL` | Provider response JSON |

### 3.5 `payment_idempotency` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 identifier |
| `idempotency_key` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Cryptographic client/gateway idempotency key |
| `resource_id` | `VARCHAR(36)` | `NOT NULL` | ID of resulting transaction or payment |
| `resource_type` | `VARCHAR(50)` | `NOT NULL` | `TRANSACTION`, `PAYMENT`, `LEDGER` |
| `status_code` | `INT` | `NOT NULL DEFAULT 200` | HTTP status code to replay |
| `response_body` | `TEXT` | `NOT NULL` | Cached JSON response to replay |
| `expires_at` | `DATETIME` | `NOT NULL` | Idempotency lock expiration |

### 3.6 `payment_webhooks` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | UUIDv4 identifier |
| `provider` | `VARCHAR(50)` | `NOT NULL` | `PAYSTACK`, `FLUTTERWAVE`, etc. |
| `event_id` | `VARCHAR(100)` | `NULL` | External event identifier |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | Event slug (`charge.success`, etc.) |
| `reference` | `VARCHAR(100)` | `NULL` | Extracted transaction/payment reference |
| `signature` | `TEXT` | `NULL` | Inbound cryptographic signature |
| `payload` | `TEXT` | `NOT NULL` | Complete raw JSON payload |
| `processed` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | 1 if applied to wallet; 0 if pending/skipped |
| `processed_at` | `DATETIME` | `NULL` | Processing completion timestamp |
| `error_message` | `TEXT` | `NULL` | Error details if processing failed |

---

## 4. Provider Adapter Architecture

To prevent vendor lock-in and adhere to clean architecture, all external payment interactions are isolated behind a unified provider abstraction.

### 4.1 `PaymentProviderInterface` Contract

```php
namespace Hambak\Services\Payments;

interface PaymentProviderInterface
{
    /**
     * Get unique provider identifier slug (e.g. 'paystack', 'flutterwave')
     */
    public function getIdentifier(): string;

    /**
     * Initialize a payment session with the provider.
     * Returns authorization URL, access code, and normalized reference.
     */
    public function initializePayment(array $params): PaymentInitializationResult;

    /**
     * Query provider API directly to verify transaction status.
     */
    public function verifyPayment(string $reference): PaymentVerificationResult;

    /**
     * Cryptographically verify inbound webhook signature against provider secret.
     */
    public function verifyWebhookSignature(string $rawPayload, array $headers): bool;

    /**
     * Parse inbound webhook payload into normalized event data.
     */
    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent;
}
```

### 4.2 Normalized Value Objects
- **`PaymentInitializationResult`**: Contains `success` (bool), `reference` (string), `authorizationUrl` (string), `providerReference` (nullable string), and `metadata` (array).
- **`PaymentVerificationResult`**: Contains `success` (bool), `status` (`SUCCESSFUL`, `FAILED`, `PENDING`), `amount` (float), `currency` (string), `providerReference` (string), `paidAt` (nullable string), and `rawResponse` (array).
- **`NormalizedWebhookEvent`**: Contains `eventId` (string), `eventType` (string), `reference` (string), `amount` (float), `status` (string), `rawPayload` (string).

### 4.3 Concrete Adapters
1. **`PaystackAdapter`**:
   - Webhook Verification: Computes `hash_hmac('sha512', $rawPayload, $secretKey)` and compares against `HTTP_X_PAYSTACK_SIGNATURE` using `hash_equals()`.
   - Endpoint: `https://api.paystack.co/transaction/initialize` and `https://api.paystack.co/transaction/verify/{ref}`.
   - Handles test and live modes cleanly via configuration.
2. **`FlutterwaveAdapter`**:
   - Webhook Verification: Compares header `HTTP_VERIF_HASH` against configured Flutterwave Secret Hash using `hash_equals()`.
   - Endpoint: `https://api.flutterwave.com/v3/payments` and `https://api.flutterwave.com/v3/transactions/{id}/verify`.
3. **`MoniepointAdapter`**:
   - Supports dynamic virtual accounts for instant bank transfer settlement.
4. **`BankTransferAdapter`**:
   - Generates official HambakTech & Services corporate account reference instructions for manual bank deposits, placing the transaction in `PENDING` state until administrative verification.

### 4.4 Payment Provider Factory & Registry
- `PaymentProviderRegistry` resolves the active adapter based on the requested channel or database configuration in `system_providers`.

---

## 5. Financial State Machines & Lifecycles

### 5.1 Payment Attempt Lifecycle (`payments` table)

```
[INITIATED]
     │
     ▼
 [PENDING] ───────► (Gateway Timeout / Abandoned) ───────► [ABANDONED]
     │
     ├───────────► (Card Declined / Fraud / Error) ──────► [FAILED]
     │
     ▼ (Webhook Confirmed OR Verified Requery)
[SUCCESSFUL] ─────► Triggers Wallet Credit within ACID Transaction
```

- **Invariant:** A payment in `SUCCESSFUL` status cannot transition to `FAILED` or `PENDING`. It is terminal.
- **Invariant:** A transition to `SUCCESSFUL` must atomically invoke `WalletService::credit()` within the same database transaction.

### 5.2 Transaction Status Lifecycle (`transactions` table)

```
 [PENDING] ───────► (Failure / Rejection) ───────────────► [FAILED]
     │
     ├───────────► (Gateway Success / Balance Settled) ──► [SUCCESSFUL]
     │                                                          │
     │                                                          ▼ (Admin / Dispute)
     └─────────────────────────────────────────────────────► [REVERSED]
```

- **Rules:**
  - `WALLET_FUNDING` starts in `PENDING` during gateway redirect; transitions to `SUCCESSFUL` when funds settle.
  - `SERVICE_PAYMENT` debited from wallet transitions immediately to `SUCCESSFUL` because balance deduction is synchronous.
  - If a service fails fulfillment, an admin or automated refund moves the original transaction to `REVERSED` and logs an opposite `CREDIT` in `wallet_ledger`.

### 5.3 Wallet Status Lifecycle (`wallets` table)

```
  ┌──────────────┐
  │    ACTIVE    │ ◄─── Normal operation: credits and debits allowed.
  └──────┬───────┘
         │
    (Admin Freeze / Risk Trigger)
         ▼
  ┌──────────────┐
  │    FROZEN    │ ◄─── Account locked: debits blocked; incoming credits queued or blocked.
  └──────┬───────┘
         │
    (KYC Exceeded / Compliance Lock)
         ▼
  ┌──────────────┐
  │  RESTRICTED  │ ◄─── Limited limits: debits capped by KYC tier limits.
  └──────────────┘
```

---

## 6. End-to-End Two-Phase Wallet Funding Flow

```
User (Browser)               Next.js Client             PHP Backend                 Payment Gateway
      │                             │                        │                              │
   1. │ Clicks "Fund ₦10,000"       │                        │                              │
      ├────────────────────────────►│                        │                              │
      │                             │ 2. POST /api/wallet/   │                              │
      │                             │    fund/initialize     │                              │
      │                             ├───────────────────────►│                              │
      │                             │                        │ 3. Create PENDING            │
      │                             │                        │    Transaction & Payment     │
      │                             │                        │ 4. Call Gateway Initialize   │
      │                             │                        ├─────────────────────────────►│
      │                             │                        │ 5. Returns Auth URL          │
      │                             │                        │◄─────────────────────────────┤
      │                             │ 6. Returns Auth URL    │                              │
      │                             │◄───────────────────────┤                              │
      │ 7. Redirect to Gateway      │                        │                              │
      │◄────────────────────────────┤                        │                              │
      │                                                      │                              │
   8. │ User pays on Paystack/Flutterwave                    │                              │
      ├────────────────────────────────────────────────────────────────────────────────────►│
      │                                                      │                              │
      │ 9. User redirected back to /dashboard/wallet/verify  │   10. Inbound Webhook Event  │
      ├────────────────────────────►│                        │◄─────────────────────────────┤
      │                             │                        │                              │
      │                             │                        │ 11. Verify HMAC Signature    │
      │                             │                        │ 12. Check Idempotency Table  │
      │                             │                        │ 13. BEGIN TRANSACTION        │
      │                             │                        │     - Lock Wallet FOR UPDATE │
      │                             │                        │     - Insert Wallet Ledger   │
      │                             │                        │     - Update Wallet Balance  │
      │                             │                        │     - Update Tx & Payment    │
      │                             │                        │     - Record Audit Log       │
      │                             │                        │ 14. COMMIT TRANSACTION       │
      │                             │                        │ 15. Return 200 OK to Gateway │
      │                             │                        ├─────────────────────────────►│
      │ 16. Polls /api/wallet       │                        │                              │
      │     fund/verify             │                        │                              │
      ├────────────────────────────►├───────────────────────►│                              │
      │                             │ 17. Wallet confirmed!  │                              │
      │ 18. Shows updated balance   │◄───────────────────────┤                              │
      │◄────────────────────────────┤                        │                              │
```

---

## 7. Formal API Contract Specification

### 7.1 Customer Endpoints (`/api/wallet/*`)

#### `GET /api/wallet`
- **Auth:** Customer / Admin session required.
- **Description:** Returns the authenticated user's current wallet state.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Wallet retrieved successfully.",
    "data": {
      "id": "wal-12345",
      "userId": "usr-98765",
      "balance": 25000.00,
      "currentBalance": 25000.00,
      "ledgerBalance": 25000.00,
      "lockedBalance": 0.00,
      "currency": "NGN",
      "status": "ACTIVE",
      "updatedAt": "2026-09-22T10:00:00Z"
    }
  }
  ```

#### `GET /api/wallet/transactions`
- **Auth:** Customer / Admin session required.
- **Query Params:** `limit` (default: 20, max: 100), `offset` (default: 0), `type`, `status`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "transactions": [
        {
          "id": "tx-12345",
          "reference": "HT-TX-2026-098712",
          "type": "WALLET_FUNDING",
          "amount": 10000.00,
          "fee": 0.00,
          "totalAmount": 10000.00,
          "currency": "NGN",
          "status": "SUCCESSFUL",
          "channel": "PAYSTACK",
          "description": "Wallet funding via Paystack",
          "createdAt": "2026-09-22T09:45:00Z"
        }
      ],
      "pagination": { "limit": 20, "offset": 0, "total": 1 }
    }
  }
  ```

#### `GET /api/wallet/ledger`
- **Auth:** Customer / Admin session required.
- **Description:** Returns the double-entry accounting ledger entries for the user's wallet.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "led-12345",
        "type": "CREDIT",
        "amount": 10000.00,
        "balanceBefore": 15000.00,
        "balanceAfter": 25000.00,
        "reference": "HT-TX-2026-098712",
        "category": "WALLET_FUNDING",
        "description": "Wallet funding via Paystack",
        "createdAt": "2026-09-22T09:45:00Z"
      }
    ]
  }
  ```

#### `POST /api/wallet/fund/initialize`
- **Auth:** Customer session required.
- **Request Body:**
  ```json
  {
    "amount": 10000,
    "channel": "PAYSTACK",
    "idempotencyKey": "idem-uuid-123"
  }
  ```
- **Validation:** `amount` $\ge 100.00$, `channel` in `['PAYSTACK', 'FLUTTERWAVE', 'MONIEPOINT', 'BANK_TRANSFER']`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Payment initialized successfully.",
    "data": {
      "reference": "HT-FUND-2026-981245",
      "authorizationUrl": "https://checkout.paystack.com/access_code_123",
      "amount": 10000.00,
      "currency": "NGN",
      "channel": "PAYSTACK"
    }
  }
  ```

#### `POST /api/wallet/fund/verify`
- **Auth:** Customer session required.
- **Request Body:**
  ```json
  {
    "reference": "HT-FUND-2026-981245"
  }
  ```
- **Description:** Server queries provider API directly. If provider confirms settlement, wallet is credited within an ACID transaction and returns updated balance.

---

### 7.2 Webhook Ingestion (`/api/payments/webhook/{provider}`)

#### `POST /api/payments/webhook/paystack` & `/api/payments/webhook/flutterwave`
- **Auth:** Public endpoint protected by Cryptographic HMAC Signature.
- **Headers Verified:**
  - Paystack: `X-Paystack-Signature` against `PAYSTACK_SECRET_KEY`.
  - Flutterwave: `verif-hash` against `FLUTTERWAVE_SECRET_HASH`.
- **Idempotency Execution:**
  1. Record raw webhook in `payment_webhooks` (`processed = 0`).
  2. If signature fails, log and respond `400 Bad Request`.
  3. Extract transaction reference.
  4. Query `SELECT * FROM payment_idempotency WHERE idempotency_key = ? FOR UPDATE`. If already executed, return `200 OK` immediately.
  5. Check `payments` and `transactions` status. If already `SUCCESSFUL`, mark webhook `processed = 1` and return `200 OK`.
  6. Execute `WalletService::credit()` inside `Database::transaction()`.
  7. Mark webhook `processed = 1`, record audit log, return `200 OK`.

---

### 7.3 Admin Financial Endpoints (`/api/admin/*`)

#### `GET /api/admin/wallets`
- **Auth:** `super_admin`, `admin`, `staff`.
- **Query Params:** `search`, `status`, `limit`, `offset`.
- **Description:** Paginated listing of all platform wallets with owner profile and reconciled balance info.

#### `POST /api/admin/wallets/adjust`
- **Auth:** `super_admin`, `admin` only.
- **Request Body:**
  ```json
  {
    "userId": "usr-12345",
    "amount": 5000,
    "type": "CREDIT",
    "reason": "Administrative goodwill refund for canceled print order"
  }
  ```
- **Validation:** Positive amount, non-empty reason, target user exists.
- **Execution:** Calls `WalletService::credit()` or `debit()` with `category = 'ADMIN_ADJUSTMENT'`. Records entry in `audit_logs` capturing actor identity and IP address.

#### `PATCH /api/admin/wallets/status`
- **Auth:** `super_admin`, `admin` only.
- **Request Body:**
  ```json
  {
    "userId": "usr-12345",
    "status": "FROZEN",
    "reason": "Suspected unauthorized chargeback investigation"
  }
  ```
- **Effect:** Immediately freezes wallet, preventing outbound debits.

#### `GET /api/admin/transactions`
- **Auth:** `super_admin`, `admin`, `staff`.
- **Query Params:** `search`, `type`, `status`, `channel`, `dateFrom`, `dateTo`, `limit`, `offset`.

#### `POST /api/admin/transactions/requery`
- **Auth:** `super_admin`, `admin`.
- **Request Body:** `{ "reference": "HT-TX-..." }`.
- **Description:** Forces backend to contact the external gateway provider and sync status.

#### `POST /api/admin/transactions/reverse`
- **Auth:** `super_admin` only.
- **Request Body:** `{ "reference": "HT-TX-...", "reason": "Authorized chargeback reversal" }`.
- **Description:** Reverses a transaction, executes balancing double-entry ledger debit/credit, and updates status to `REVERSED`.

#### `GET /api/admin/reconciliation`
- **Auth:** `super_admin`, `admin`.
- **Description:** Scans all platform wallets and verifies `wallet.balance == SUM(credits) - SUM(debits)` and `wallet.balance == latest_ledger.balance_after`. Reports any discrepancies.

---

## 8. Concurrency & Security Safeguards

### 8.1 Pessimistic Concurrency Pattern (`WalletService.php`)
```php
Database::transaction(function (PDO $pdo) use ($userId, $amount, $type, $reference, $category, $description) {
    // 1. Lock the wallet row exclusively for the duration of the transaction
    $stmt = $pdo->prepare("
        SELECT id, user_id, balance, ledger_balance, status 
        FROM wallets 
        WHERE user_id = ? 
        FOR UPDATE
    ");
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();

    if (!$wallet) {
        throw new Exception("Wallet not found for user: {$userId}");
    }

    if ($wallet['status'] !== 'ACTIVE') {
        throw new Exception("Wallet is currently {$wallet['status']} and cannot process operations.");
    }

    $balanceBefore = (float)$wallet['balance'];

    if ($type === 'DEBIT') {
        if ($balanceBefore < $amount) {
            throw new Exception("Insufficient wallet balance. Available: ₦{$balanceBefore}, Required: ₦{$amount}");
        }
        $balanceAfter = $balanceBefore - $amount;
    } else {
        $balanceAfter = $balanceBefore + $amount;
    }

    // 2. Update wallet balances
    $updateStmt = $pdo->prepare("
        UPDATE wallets 
        SET balance = ?, ledger_balance = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $updateStmt->execute([$balanceAfter, $balanceAfter, $wallet['id']]);

    // 3. Append immutable double-entry ledger record
    $ledgerStmt = $pdo->prepare("
        INSERT INTO wallet_ledger (id, wallet_id, transaction_id, type, amount, balance_before, balance_after, reference, category, description, created_at)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $ledgerStmt->execute([
        $wallet['id'],
        $txId ?? null,
        $type,
        $amount,
        $balanceBefore,
        $balanceAfter,
        $reference,
        $category,
        $description
    ]);

    return [
        'walletId'      => $wallet['id'],
        'balanceBefore' => $balanceBefore,
        'balanceAfter'  => $balanceAfter,
        'amount'        => $amount,
        'reference'     => $reference,
    ];
});
```

### 8.2 Mass-Assignment & IDOR Defenses
- Customer endpoints strictly bind queries to `getAuthUser()['id']`. Customers cannot pass a `userId` parameter to view or fund another customer's wallet.
- Admin endpoints strictly require the `super_admin` or `admin` role checked via `requireRoles(['super_admin', 'admin'])`.
- Any attempt by staff or customer to access `/api/admin/wallets/adjust` returns `403 Forbidden`.

---

## 9. Next.js Client Experience & Real-Time Sync

### 9.1 Customer Wallet Dashboard (`/dashboard/wallet`)
- **Balance Card:** Shows Live Available Balance (large display), Ledger Balance, and Status Badge (`Active`, `Frozen`).
- **Quick Actions:** "Add Funds", "Transaction History", "Download Statement".
- **Recent Transactions Widget:** Displays latest 5 ledger transactions with color-coded badge (`+` Green for Credit, `-` Dark for Debit).
- **Error & Loading States:** Graceful skeleton loaders, retry button, and clear feedback.

### 9.2 Funding Flow UI (`/dashboard/wallet/fund`)
- **Step 1:** Amount input with preset chips (₦2,000, ₦5,000, ₦10,000, ₦20,000, ₦50,000).
- **Step 2:** Payment channel selection (Paystack Card/USSD, Flutterwave, Moniepoint, Bank Transfer).
- **Step 3:** Initialization calling `POST /api/wallet/fund/initialize`.
  - For online gateways: Redirects to secure authorization URL or opens popup.
  - For bank transfer: Displays official HambakTech corporate bank account details (Bank Name, Account Number, Account Name, Payment Reference).
- **Step 4:** Automatic callback verification (`/dashboard/wallet/verify?reference=...`) polling backend until payment is confirmed.

### 9.3 Administrative Wallet Center (`/admin/wallets`)
- **Metric Cards:** Total System Circulating Balance, Total Active Wallets, Total Frozen Wallets, Total 24h Deposit Volume.
- **Wallet Directory:** Searchable by user name, email, phone, or wallet ID.
- **Adjustment Modal:** Credit/Debit modal with mandatory reason input and double-confirmation dialog.
- **Status Toggle:** Freeze/Unfreeze wallet with audit log notation.

---

## 10. Milestone 5 Implementation Roadmap

Following architectural approval, Milestone 5 will be implemented across four sequential, verified phases:

- **Phase 1: Backend Foundation & Provider Adapter Engine**
  - Implement `PaymentProviderInterface`, `PaystackAdapter`, `FlutterwaveAdapter`, `MoniepointAdapter`, and `BankTransferAdapter`.
  - Refactor `WalletService.php` to enforce double-entry ledger invariants, idempotent execution, and automated reconciliation.
  - Implement `PaymentsController.php` with `/api/payments/webhook/{provider}`, `/api/wallet/fund/initialize`, and `/api/wallet/fund/verify`.

- **Phase 2: Administrative Financial Control Suite**
  - Complete `AdminController.php` financial endpoints (`adjustWallet`, `updateWalletStatus`, `listTransactions`, `requeryPayment`, `reconcileWallets`).
  - Add reconciliation scanner verifying `wallet.balance == SUM(credits) - SUM(debits)`.

- **Phase 3: Frontend Customer Experience & Client Sync**
  - Update `src/lib/api-client/index.ts` with typed methods for wallet and transactions.
  - Refactor `/dashboard/wallet/page.tsx`, `/dashboard/wallet/fund/page.tsx`, and `/dashboard/wallet/transactions/page.tsx` to align with the normalized DTO schema.
  - Implement `/dashboard/wallet/verify/page.tsx` for post-gateway callback verification.

- **Phase 4: Automated Testing & Verification Suite**
  - Create dedicated M5 PHP test suite (`php-backend/tests/WalletFinancialTest.php`) verifying:
    1. Wallet creation on user registration.
    2. Concurrency race conditions (`FOR UPDATE` locking).
    3. Idempotent funding and duplicate webhook prevention.
    4. Non-negative balance constraint and overdraft rejection.
    5. Double-entry ledger invariant verification.
    6. Admin adjustment audit logging.
    7. Webhook HMAC signature verification.
  - Run full verification gates (TypeScript, ESLint, production build).

---

*HambakTech Smart Digital Platform — Where Technology Meet Service*
