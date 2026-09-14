import { NextRequest } from "next/server";
import { resetPassword } from "@/lib/auth-service";
import { validateData, ResetPasswordSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { TooManyRequestsError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, "AUTH_RESET_PASSWORD");
    if (!rateLimit.success) {
      const resp = errorResponse(
        new TooManyRequestsError("Too many password reset attempts. Please wait before trying again.")
      );
      Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
      return resp;
    }

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
