import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PaymentService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
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

    return successResponse(paymentIntent, "Payment initialized.");
  } catch (error) {
    return errorResponse(error, "Failed to initialize payment");
  }
}
