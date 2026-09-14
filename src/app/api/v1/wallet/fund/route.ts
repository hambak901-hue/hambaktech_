import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { validateData, FundWalletSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // 1. CSRF Verification for browser requests
  verifyCsrf(req);

  // 2. Enforce Rate Limiting (10 funding attempts per minute)
  const rateLimit = enforceRateLimit(req, "WALLET_FUND");
  if (!rateLimit.success) {
    const resp = errorResponse(
      new Error("Wallet funding transaction rate limit exceeded. Please wait a moment."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  try {
    const session = await requireAuth(req);
    const rawBody = await req.json();
    const validated = validateData(FundWalletSchema, rawBody);

    const { wallet, transaction } = await WalletService.fundWallet({
      userId: session.userId,
      userName: session.fullName || session.email,
      userEmail: session.email,
      amount: validated.amount,
      paymentMethod: validated.gateway,
      reference: validated.reference,
      description: rawBody.description,
    });

    const response = successResponse(
      {
        wallet: {
          id: wallet.id,
          currentBalance: wallet.currentBalance,
          currency: wallet.currency,
        },
        transaction,
      },
      `Wallet funded with ₦${validated.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} successfully.`
    );

    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    const resp = errorResponse(error, "Wallet funding failed");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
