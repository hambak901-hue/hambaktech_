import { NextRequest } from "next/server";
import { resetPassword } from "@/lib/auth-service";
import { validateData, ResetPasswordSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateData(ResetPasswordSchema, body);

    await resetPassword(validated.token, validated.newPassword);

    return successResponse(
      null,
      "Password has been reset successfully. You may now log in with your new credentials."
    );
  } catch (error) {
    return errorResponse(error, "Password reset failed");
  }
}
