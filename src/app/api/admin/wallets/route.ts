import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.WALLET_READ, req);
    const wallets = await AdminService.getWallets();
    return successResponse(wallets, "Wallets retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.WALLET_ADJUST, req);
    const body = await req.json();

    if (!body.userId || !body.amount || !body.type) {
      return errorResponse(new Error("userId, amount, and type (CREDIT/DEBIT) are required"), 400);
    }

    const updatedWallet = await AdminService.adjustWalletBalance(
      body.userId,
      Number(body.amount),
      body.type,
      body.description || "Manual admin adjustment",
      session.fullName || session.email
    );

    return successResponse(updatedWallet, "Wallet balance adjusted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
