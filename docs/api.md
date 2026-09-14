# HambakTech Smart Digital Platform — API Architecture & Integrations

**Architecture Type:** RESTful JSON API (PHP 8.x on cPanel)  
**Status:** ARCHITECTURAL DESIGN — ZERO ENDPOINTS IMPLEMENTED IN MILESTONE 1  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. Core API Principles

1. **Decoupled Architecture:** The Next.js frontend, future mobile app, and external partners communicate with the backend exclusively via standard HTTPS REST endpoints.
2. **Provider Adapter Pattern:** Third-party gateways (Paystack, Flutterwave, telecom vendors) are wrapped inside strict interface adapters. Changing or adding a provider requires implementing a single adapter without altering core business domains.
3. **Zero Frontend Trust:** Never trust frontend payment-success callbacks, local balances, or user-submitted status updates. Every financial settlement and credential check is verified server-to-server.
4. **Idempotency:** Every payment processing endpoint and incoming webhook requires a unique idempotency key or reference hash to prevent duplicate charges or double credit.
5. **Standardized Response Envelope:** All endpoints adhere to a consistent JSON format:
   ```json
   {
     "success": true,
     "message": "Operation completed successfully.",
     "data": {},
     "meta": { "timestamp": 1773367200 }
   }
   ```

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
