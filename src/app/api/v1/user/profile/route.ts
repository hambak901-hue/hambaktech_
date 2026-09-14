import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateUserProfile } from "@/lib/auth-service";
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
        walletBalance: wallet.currentBalance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch user profile");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const updatedUser = await updateUserProfile(session.userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
    });

    return successResponse({
      user: updatedUser,
    }, "Profile updated successfully.");
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}
