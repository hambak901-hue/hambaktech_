import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PaymentService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  verifyCsrf(req);

  const rateLimit = enforceRateLimit(req, "WALLET_FUND");
  if (!rateLimit.success) {
    const resp = errorResponse(
      new Error("Payment initialization rate limit exceeded. Please wait a moment."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const amount = Number(body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ValidationError("Payment amount must be greater than zero.");
    }

    const gateway = body.gateway || "PAYSTACK";
    const allowed = ["PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "WALLET", "BANK_TRANSFER"];
    if (!allowed.includes(gateway)) {
      throw new ValidationError(`Invalid gateway: ${gateway}`);
    }

    const paymentIntent = await PaymentService.initializePayment({
      userId: session.userId,
      userName: session.fullName || session.email,
      userEmail: session.email,
      amount,
      gateway,
      purpose: body.purpose || "WALLET_FUNDING",
      metadata: body.metadata,
    });

    const response = successResponse(paymentIntent, "Payment initialized.");
    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    const resp = errorResponse(error, "Failed to initialize payment");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
