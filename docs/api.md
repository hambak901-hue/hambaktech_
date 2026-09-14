# HambakTech Smart Digital Platform — API Architecture & Integrations

**Architecture Type:** RESTful JSON API (Next.js App Router / TypeScript)  
**Status:** IMPLEMENTED & OPERATIONAL (Milestone 11 — Mobile API)  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  
**OpenAPI Specification:** `/api/v1/openapi.json`  
**Interactive API Console:** `/api-docs`  

---

## 1. Core API Principles

1. **Decoupled Multi-Client Architecture:** The Next.js web portal, Android client, and iOS client communicate with the authoritative HambakTech backend via standard HTTPS REST endpoints under `/api/v1/*`.
2. **Zero Client Trust:** Mobile devices and browsers are untrusted clients. User IDs, roles, permissions, prices, wallet balances, order totals, and payment verifications are strictly computed and enforced server-side.
3. **Single Authoritative Data Store:** The same users, same wallet ledger, same orders, same payments, and same services are shared identically across Web, Android, and iOS. Zero duplicated business logic.
4. **Unified Authentication:** Supports both `Authorization: Bearer <session_token>` header (standard for mobile native clients: OkHttp, Retrofit, URLSession, Alamofire) and secure HTTP-only cookies (for browser sessions).
5. **Idempotency & Double-Entry Ledger:** Every financial debit or credit writes an immutable `WalletLedgerEntry` recording the exact `balanceAfter`.
6. **Standardized Response Envelopes:**
   - **Success (200/201):**
     ```json
     {
       "success": true,
       "message": "Operation completed successfully.",
       "data": { ... },
       "meta": { "timestamp": "2026-09-14T07:00:00.000Z" }
     }
     ```
   - **Error (400/401/403/404/500):**
     ```json
     {
       "success": false,
       "error": {
         "code": "VALIDATION_ERROR",
         "message": "Specific error explanation",
         "details": []
       },
       "timestamp": "2026-09-14T07:00:00.000Z"
     }
     ```

---

## 2. Implemented Endpoint Reference (v1)

### 2.1 Authentication (`/api/v1/auth/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | None | Authenticates email/phone & password. Returns session Bearer token and user payload. |
| `POST` | `/api/v1/auth/register` | None | Registers new customer account, hashes password, initializes user wallet. |
| `GET` | `/api/v1/auth/me` | Bearer | Returns current authenticated user profile, permissions, and live wallet state. |
| `POST` | `/api/v1/auth/refresh` | Bearer | Refreshes and extends active session duration for mobile apps. |
| `POST` | `/api/v1/auth/logout` | Bearer | Revokes current session token server-side and clears cookies. |

### 2.2 User Profile (`/api/v1/user/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/user/profile` | Bearer | Retrieves full user profile, contact info, and customer tier. |
| `PATCH` | `/api/v1/user/profile` | Bearer | Updates user profile fields (firstName, lastName, phone, avatarUrl). |
| `POST` | `/api/v1/user/password` | Bearer | Changes user password with server-side current password verification. |

### 2.3 Wallet & Transactions (`/api/v1/wallet/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/wallet` | Bearer | Authoritative current, ledger, and locked balances with currency code. |
| `GET` | `/api/v1/wallet/transactions` | Bearer | Paginated transaction history with filtering by `type` and `status`. |
| `POST` | `/api/v1/wallet/fund` | Bearer | Initiates or credits wallet funding via Paystack, Flutterwave, or Moniepoint. |

### 2.4 Orders & Fulfillment (`/api/v1/orders/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/orders` | Bearer | Lists user's digital service orders (or all orders for administrative roles). |
| `POST` | `/api/v1/orders` | Bearer | Places digital service order with server-calculated unit prices and item validation. |
| `GET` | `/api/v1/orders/:id` | Bearer | Fetches order detail with strict user ownership enforcement (403 for unauthorized access). |

### 2.5 Payments Engine (`/api/v1/payments/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/payments/gateways` | None | Returns list of enabled payment gateways and channels. |
| `POST` | `/api/v1/payments/initialize` | Bearer | Initializes gateway transaction reference and checkout URL. |
| `POST` | `/api/v1/payments/verify` | Bearer | Verifies payment reference server-to-server and triggers ledger settlement. |

### 2.6 Digital Services Catalog (`/api/v1/services/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/services` | None | Lists available services with optional `category` filter. |
| `GET` | `/api/v1/services/categories` | None | Returns active service categories. |
| `GET` | `/api/v1/services/:slug` | None | Service details, requirements, SLA, and pricing structure. |
| `POST` | `/api/v1/services/calculate-price` | None | Server-authoritative dynamic pricing calculator applying customer tier markups. |

### 2.7 Academy & Training (`/api/v1/academy/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/academy/courses` | None | Courses catalog with syllabus, modules, tuition fees, and instructors. |
| `GET` | `/api/v1/academy/courses/:id` | None | Single course detail with modules, prerequisites, and certification details. |
| `POST` | `/api/v1/academy/enroll` | Bearer | Enrolls student into cohort with optional authoritative wallet tuition debit. |
| `GET` | `/api/v1/academy/enrollments` | Bearer | Returns the student's active course enrollments and cohort schedules. |
| `GET` | `/api/v1/academy/certificates` | Bearer | Returns verified completion certificates with tamper-proof verification URLs. |
| `GET` | `/api/v1/academy/id-cards` | Bearer | Returns verified digital student identity cards with scannable QR codes. |

### 2.8 Shop & Inventory (`/api/v1/shop/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/shop/products` | None | Browse hardware products with search and category filtering. |
| `GET` | `/api/v1/shop/products/:id` | None | Product details, specifications, warranty, and real-time stock levels. |
| `GET` | `/api/v1/shop/categories` | None | Product category tree and taxonomy. |
| `GET` | `/api/v1/shop/delivery-zones` | None | Delivery zones and flat-rate distance delivery fees. |
| `POST` | `/api/v1/shop/orders` | Bearer | Submits shop order with real-time stock reservation, zone fee calculation, and payment. |

### 2.9 Notifications (`/api/v1/notifications/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Bearer | Retrieves user notifications and system-wide announcements with unread counter. |
| `PATCH` | `/api/v1/notifications/:id/read` | Bearer | Marks a single notification as read. |
| `POST` | `/api/v1/notifications/read-all` | Bearer | Marks all notifications as read for current user. |

### 2.10 System & Metadata (`/api/v1/system/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/system/config` | None | Mobile client configuration, minimum supported Android/iOS versions, support contacts. |
| `GET` | `/api/v1/system/health` | None | System uptime, database connectivity status, and platform resource counts. |
| `GET` | `/api/v1/openapi.json` | None | Official OpenAPI 3.0.3 machine-readable specification. |

---

## 2. Payment Processing Architecture

The payment workflow adheres to a strict server-authoritative double-validation cycle:

```
[ Customer ]
     |
     v
[ Checkout Page (Next.js) ]
     |
     v (POST /api/v1/payments/initialize)
[ Payment Service (PHP) ]
     |
     +---> [ Provider Adapter (e.g. Paystack / Flutterwave) ]
                 |
                 v
           [ Payment Gateway ]
                 |
                 v
           (User Authorizes Payment)
                 |
                 +-----------------------+
                 |                       |
                 v (Redirect)            v (HTTPS Webhook)
     [ Frontend Success View ]   [ Webhook Endpoint (/api/v1/webhooks/*) ]
                 |                       |
                 |                       v
                 |               [ Webhook Signature Verification ]
                 |                       |
                 |                       v
                 |               [ Idempotency Check ]
                 |                       |
                 |                       v
                 |               [ Server-side Gateway Re-verification ]
                 |                       |
                 |                       v
                 |               [ Double-Entry Payment Ledger Write ]
                 |                       |
                 |                       v
                 |               [ Wallet Topup / Service Order Fulfillment ]
                 |                       |
                 v                       v
      (Queries /payments/verify) <-------+
```

### Critical Rules:
- A frontend redirect is treated solely as a UI routing hint.
- Account crediting, order status updates, or certificate issuance occurs **only** after the server verifies cryptographic webhook signatures or receives a direct server-to-server `200 OK` response from the payment gateway's verification endpoint.

---

## 3. Provider Adapters & Interfaces [PLANNED]

To shield the core application from upstream provider API changes, all integrations implement defined interfaces:

### 3.1 Payment Gateway Adapter (`PaymentGatewayInterface`)
- `initializeTransaction(PaymentRequest $request): PaymentInitializationResult`
- `verifyTransaction(string $reference): PaymentVerificationResult`
- `verifyWebhookSignature(string $rawPayload, string $signature): bool`
- `processRefund(string $reference, float $amount): RefundResult`

Planned Implementations:
- `PaystackAdapter`
- `FlutterwaveAdapter`
- `RemitaAdapter`
- `MoniepointBankTransferAdapter` (for dedicated virtual accounts and manual slips)

### 3.2 Identity & Verification Adapter (`IdentityServiceInterface`)
- `verifyNIN(string $ninNumber): NINVerificationResult`
- `verifyBVN(string $bvnNumber): BVNVerificationResult`
- `submitCACFiling(CACFilingRequest $request): CACSubmissionResult`

Planned Implementations:
- Approved NIMC licensed integration partner adapter
- Certified identity verification aggregator adapter

### 3.3 Telecom VTU Adapter (`TelecomVTUInterface`)
- `purchaseAirtime(string $phone, string $network, float $amount): VTUResult`
- `purchaseData(string $phone, string $network, string $planId): VTUResult`
- `checkBalance(): VTUBalanceResult`

Planned Implementations:
- Primary Nigerian VTU provider adapter
- Failover secondary VTU provider adapter

### 3.4 Notification & Communications Adapter (`NotificationInterface`)
- `sendEmail(string $to, string $subject, string $htmlBody): bool`
- `sendSMS(string $phone, string $message): bool`
- `sendWhatsApp(string $phone, string $templateId, array $parameters): bool`

---

## 4. Planned Endpoint Groups

| Route Group | Base Path | Description | Status |
|---|---|---|---|
| **Auth** | `/api/v1/auth/*` | Login, Register, Password Reset, Refresh Token, Profile | PLANNED (Schema Ready) |
| **Services** | `/api/v1/services/*` | Catalog, Service Orders, File Uploads, Tracking | PLANNED (Schema Ready) |
| **Wallets** | `/api/v1/wallet/*` | Balance check, History, Top-up Init, Ledger Statement | PLANNED (Schema Ready) |
| **Payments** | `/api/v1/payments/*` | Initialize checkout, Verify reference, Webhooks | PLANNED (Schema Ready) |
| **Academy** | `/api/v1/academy/*` | Courses, Enrollment, Lessons, Certificate verification | PLANNED (Schema Ready) |
| **Shop** | `/api/v1/shop/*` | Products, Categories, Cart, Order submission | PLANNED (Schema Ready) |
| **Identity** | `/api/v1/identity/*` | NIN requests, BVN validation, Slip generation | PLANNED (Schema Ready) |
| **Telecom** | `/api/v1/telecom/*` | Airtime purchase, Data bundle list and ordering | PLANNED (Schema Ready) |
| **Admin** | `/api/v1/admin/*` | Order status management, User control, Pricing updates | PLANNED (Schema Ready) |

*Milestone 3 note: Authoritative database schemas, constraints, and data contracts have been fully implemented in Prisma. Transitional client simulation in `src/lib/api-client/index.ts` bridges frontend components until API routes are wired in subsequent milestones.*
