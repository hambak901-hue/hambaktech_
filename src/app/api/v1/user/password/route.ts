import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { changePassword } from "@/lib/auth-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.currentPassword || !body.newPassword) {
      throw new ValidationError("Current password and new password are required.");
    }

    if (body.newPassword.length < 8) {
      throw new ValidationError("New password must be at least 8 characters long.");
    }

    await changePassword(session.userId, body.currentPassword, body.newPassword);

    return successResponse({
      updated: true,
    }, "Password changed successfully.");
  } catch (error) {
    return errorResponse(error, "Failed to change password");
  }
}
