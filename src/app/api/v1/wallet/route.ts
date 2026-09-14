import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const wallet = await WalletService.getWallet(session.userId);

    return successResponse({
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        currency: wallet.currency,
        currentBalance: wallet.currentBalance,
        ledgerBalance: wallet.ledgerBalance,
        lockedBalance: wallet.lockedBalance,
        status: wallet.status,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve wallet information");
  }
}
