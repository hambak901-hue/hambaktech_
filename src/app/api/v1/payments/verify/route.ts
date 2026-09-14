import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PaymentService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const reference = body.reference;
    if (!reference) {
      throw new ValidationError("Payment reference is required for verification.");
    }

    const verification = await PaymentService.verifyPayment(reference, session.userId);
    return successResponse(verification, "Payment verified successfully.");
  } catch (error) {
    return errorResponse(error, "Payment verification failed");
  }
}
