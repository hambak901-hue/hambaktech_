import { NextRequest } from "next/server";
import { requestPasswordReset } from "@/lib/auth-service";
import { validateData, ForgotPasswordSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict rate limiting
    const body = await req.json();
    const validated = validateData(ForgotPasswordSchema, body);

    const rateLimit = enforceRateLimit(req, "AUTH_FORGOT_PASSWORD", validated.email);
    if (!rateLimit.success) {
      return errorResponse(
        new Error("Too many password reset requests. Please try again later."),
        429,
        "TOO_MANY_REQUESTS"
      );
    }

    // 2. Generate single-use reset token and dispatch via email only
    const { token } = await requestPasswordReset(validated.email);

    if (token) {
      await emailService.sendPasswordResetEmail(validated.email, token);
    }

    // 3. Return strictly generic response without revealing account existence or any token
    return successResponse(
      {
        message: "If the account exists, password reset instructions have been sent.",
      },
      "Password reset instructions have been processed."
    );
  } catch (error) {
    return errorResponse(error, "Password recovery failed");
  }
}
