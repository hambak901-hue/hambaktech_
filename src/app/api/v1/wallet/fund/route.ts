import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const amount = Number(body.amount);
    if (!amount || isNaN(amount) || amount < 100) {
      throw new ValidationError("Minimum wallet funding amount is ₦100.00");
    }

    const paymentMethod = body.paymentMethod || "PAYSTACK";
    const allowedMethods = ["PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"];
    if (!allowedMethods.includes(paymentMethod)) {
      throw new ValidationError(`Invalid payment method. Allowed: ${allowedMethods.join(", ")}`);
    }

    const { wallet, transaction } = await WalletService.fundWallet({
      userId: session.userId,
      userName: session.fullName || session.email,
      userEmail: session.email,
      amount,
      paymentMethod,
      reference: body.reference,
      description: body.description,
    });

    return successResponse(
      {
        wallet: {
          id: wallet.id,
          currentBalance: wallet.currentBalance,
          currency: wallet.currency,
        },
        transaction,
      },
      `Wallet funded with ₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} successfully.`
    );
  } catch (error) {
    return errorResponse(error, "Wallet funding failed");
  }
}
