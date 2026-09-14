import { createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "./errors";
import { AuditService } from "./server/platform-store";

/**
 * In-memory idempotency cache for processed webhook event identifiers.
 * Prevents double-crediting wallets or duplicate order execution on repeated webhook dispatches.
 */
interface ProcessedWebhookEvent {
  eventId: string;
  provider: string;
  processedAt: Date;
  outcome: "SUCCESS" | "FAILED" | "SKIPPED";
  referenceId?: string;
}

const processedEventsMap = new Map<string, ProcessedWebhookEvent>();

export const WebhookSecurity = {
  /**
   * Verifies Paystack HMAC-SHA512 signature.
   * Paystack sends `x-paystack-signature` header computed from the raw body using the Secret Key.
   */
  verifyPaystackSignature(rawBody: string, signature: string | null, secretKey?: string): boolean {
    const secret = secretKey || process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !signature) {
      return false;
    }

    try {
      const computedHash = createHmac("sha512", secret).update(rawBody).digest("hex");
      const sigBuffer = Buffer.from(signature, "hex");
      const hashBuffer = Buffer.from(computedHash, "hex");

      if (sigBuffer.length !== hashBuffer.length) {
        return false;
      }

      return timingSafeEqual(sigBuffer, hashBuffer);
    } catch {
      return false;
    }
  },

  /**
   * Verifies Flutterwave secret hash.
   * Flutterwave sends `verif-hash` header which matches the secret hash configured in dashboard.
   */
  verifyFlutterwaveSignature(receivedHash: string | null, secretHash?: string): boolean {
    const secret = secretHash || process.env.FLUTTERWAVE_SECRET_HASH || process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret || !receivedHash) {
      return false;
    }

    try {
      const sigBuffer = Buffer.from(receivedHash);
      const secretBuffer = Buffer.from(secret);

      if (sigBuffer.length !== secretBuffer.length) {
        return false;
      }

      return timingSafeEqual(sigBuffer, secretBuffer);
    } catch {
      return false;
    }
  },

  /**
   * Checks if an event has already been successfully processed (Idempotency).
   * Returns true if already processed, false otherwise.
   */
  isDuplicateEvent(provider: string, eventId: string): boolean {
    const key = `${provider}:${eventId}`;
    const existing = processedEventsMap.get(key);
    return !!existing;
  },

  /**
   * Records a webhook event as processed to prevent replay attacks.
   */
  recordProcessedEvent(
    provider: string,
    eventId: string,
    outcome: "SUCCESS" | "FAILED" | "SKIPPED",
    referenceId?: string
  ): void {
    const key = `${provider}:${eventId}`;
    processedEventsMap.set(key, {
      eventId,
      provider,
      processedAt: new Date(),
      outcome,
      referenceId,
    });

    // Keep cache bounded to 10,000 entries
    if (processedEventsMap.size > 10000) {
      const firstKey = processedEventsMap.keys().next().value;
      if (firstKey) processedEventsMap.delete(firstKey);
    }
  },

  /**
   * Validates and logs an incoming webhook attempt.
   */
  assertWebhookAuthentic(
    provider: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT",
    rawBody: string,
    headers: {
      paystackSignature?: string | null;
      flutterwaveHash?: string | null;
      moniepointToken?: string | null;
    }
  ): void {
    let isValid = false;

    if (provider === "PAYSTACK") {
      isValid = this.verifyPaystackSignature(rawBody, headers.paystackSignature || null);
    } else if (provider === "FLUTTERWAVE") {
      isValid = this.verifyFlutterwaveSignature(headers.flutterwaveHash || null);
    } else if (provider === "MONIEPOINT") {
      const secret = process.env.MONIEPOINT_API_KEY;
      isValid = !!secret && headers.moniepointToken === secret;
    }

    if (!isValid) {
      AuditService.log({
        actorName: `${provider}_WEBHOOK_GATEWAY`,
        actorEmail: "webhook@gateway.external",
        role: "admin",
        action: "WEBHOOK_SIGNATURE_FAILED",
        entity: "PAYMENT_WEBHOOK",
        entityId: `${provider}-untrusted`,
        ipAddress: "0.0.0.0",
        status: "FAILED",
        metadata: { provider, reason: "Cryptographic signature or secret verification failed" },
      });

      throw new UnauthorizedError(`Invalid webhook cryptographic signature for provider: ${provider}`);
    }
  },
};
