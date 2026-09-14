import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const wallet = await WalletService.getWallet(session.userId);

    return successResponse({
      user: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        phone: session.phone,
        role: session.role,
        status: session.status,
        customerTier: session.customerTier,
        permissions: session.permissions,
        wallet: {
          id: wallet.id,
          currency: wallet.currency,
          currentBalance: wallet.currentBalance,
          ledgerBalance: wallet.ledgerBalance,
          lockedBalance: wallet.lockedBalance,
          status: wallet.status,
        },
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve user profile");
  }
}
