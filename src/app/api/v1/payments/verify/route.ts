import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PaymentService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  verifyCsrf(req);

  const rateLimit = enforceRateLimit(req, "PAYMENT_VERIFY");
  if (!rateLimit.success) {
    const resp = errorResponse(
      new Error("Payment verification rate limit exceeded. Please wait a moment."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const reference = body.reference;
    if (!reference) {
      throw new ValidationError("Payment reference is required for verification.");
    }

    const verification = await PaymentService.verifyPayment(reference, session.userId);
    const response = successResponse(verification, "Payment verified successfully.");
    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    const resp = errorResponse(error, "Payment verification failed");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
