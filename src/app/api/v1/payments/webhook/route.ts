import { NextRequest, NextResponse } from "next/server";
import { WebhookSecurity } from "@/lib/webhook-security";
import { enforceRateLimit } from "@/lib/rate-limit";
import { WalletService, AuditService } from "@/lib/server/platform-store";
import { sanitizeSensitiveRecord } from "@/lib/privacy";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting for webhooks
    const rateLimit = enforceRateLimit(req, "WEBHOOK_INCOMING");
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: "Webhook rate limit exceeded" },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // 2. Read raw request text (crucial for exact cryptographic signature verification)
    const rawBody = await req.text();
    const paystackSignature = req.headers.get("x-paystack-signature");
    const flutterwaveHash = req.headers.get("verif-hash");
    const moniepointToken = req.headers.get("x-moniepoint-signature") || req.headers.get("authorization");

    let provider: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" = "PAYSTACK";
    if (flutterwaveHash) {
      provider = "FLUTTERWAVE";
    } else if (moniepointToken && !paystackSignature) {
      provider = "MONIEPOINT";
    }

    // 3. Cryptographic Signature Validation
    WebhookSecurity.assertWebhookAuthentic(provider, rawBody, {
      paystackSignature,
      flutterwaveHash,
      moniepointToken,
    });

    // 4. Parse payload safely
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 });
    }

    // 5. Extract event identifiers for replay attack protection & idempotency
    const eventType = payload.event || payload["event.type"] || "charge.success";
    const eventId =
      payload.id ||
      payload.data?.id ||
      payload.data?.reference ||
      payload.txRef ||
      payload.reference ||
      `evt-${Date.now()}`;

    // 6. Check Idempotency: Reject repeated processing of same event
    if (WebhookSecurity.isDuplicateEvent(provider, String(eventId))) {
      return NextResponse.json(
        {
          success: true,
          message: "Event already processed (Idempotent response)",
          eventId,
        },
        { status: 200 }
      );
    }

    // 7. Authoritative processing for successful charges
    const isSuccess =
      eventType === "charge.success" ||
      eventType === "successful" ||
      payload.status === "successful" ||
      payload.data?.status === "success";

    if (isSuccess) {
      const data = payload.data || payload;
      const amountInNgn =
        provider === "PAYSTACK"
          ? Number(data.amount) / 100 // Paystack reports in kobo
          : Number(data.amount);

      const customerEmail = data.customer?.email || data.customerEmail || data.email;
      const reference = data.reference || data.tx_ref || data.flw_ref || String(eventId);
      const userId = data.metadata?.userId || data.metadata?.user_id;

      if (userId && amountInNgn > 0) {
        const customerName =
          data.customer?.name ||
          (data.customer?.first_name ? `${data.customer.first_name} ${data.customer.last_name || ""}`.trim() : null) ||
          data.metadata?.userName ||
          customerEmail ||
          "Customer";

        // Authoritative wallet credit
        await WalletService.fundWallet({
          userId,
          userName: customerName,
          userEmail: customerEmail || "customer@hambaktech.com",
          amount: amountInNgn,
          paymentMethod: provider,
          reference,
          description: `Wallet credit via ${provider} webhook (${reference})`,
        });
      }

      // Record event as successfully handled
      WebhookSecurity.recordProcessedEvent(provider, String(eventId), "SUCCESS", reference);

      // Audit Log
      AuditService.log({
        actorName: `${provider}_WEBHOOK_DISPATCHER`,
        actorEmail: customerEmail || "webhook@gateway.external",
        role: "admin",
        action: "PAYMENT_WEBHOOK_PROCESSED",
        entity: "PAYMENT_TRANSACTION",
        entityId: reference,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
        status: "SUCCESS",
        metadata: sanitizeSensitiveRecord({
          provider,
          eventType,
          eventId,
          amount: amountInNgn,
          reference,
          userId,
        }),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Webhook processed and transaction completed successfully",
          eventId,
        },
        { status: 200 }
      );
    }

    // Non-success events (e.g., failed, pending, refunded)
    WebhookSecurity.recordProcessedEvent(provider, String(eventId), "SKIPPED");
    return NextResponse.json(
      { success: true, message: `Event ${eventType} recorded and skipped` },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || "WEBHOOK_ERROR",
          message: error.message || "Failed to process webhook.",
        },
      },
      { status: error.statusCode || 400 }
    );
  }
}
