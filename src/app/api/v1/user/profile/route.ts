import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateUserProfile } from "@/lib/auth-service";
import { WalletService, AuditService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { verifyCsrf } from "@/lib/csrf";
import { validateData, UpdateProfileSchema } from "@/lib/validation";
import { sanitizeSensitiveRecord } from "@/lib/privacy";

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
  // Enforce CSRF check for browser sessions
  verifyCsrf(req);

  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const validated = validateData(UpdateProfileSchema, body);

    const updatedUser = await updateUserProfile(session.userId, validated);

    AuditService.log({
      actorName: session.fullName || session.email,
      actorEmail: session.email,
      role: session.role.slug as any,
      action: "PROFILE_UPDATED",
      entity: "USER_PROFILE",
      entityId: session.userId,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      status: "SUCCESS",
      metadata: sanitizeSensitiveRecord(validated),
    });

    return successResponse({
      user: updatedUser,
    }, "Profile updated successfully.");
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}
