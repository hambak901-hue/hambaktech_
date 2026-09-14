import { NextRequest } from "next/server";
import { resendVerificationToken } from "@/lib/auth-service";
import { validateData, ResendVerificationSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict rate limiting
    const body = await req.json();
    const validated = validateData(ResendVerificationSchema, body);

    const rateLimit = enforceRateLimit(req, "AUTH_RESEND_VERIFICATION", validated.email);
    if (!rateLimit.success) {
      return errorResponse(
        new Error("Too many verification email requests. Please wait before trying again."),
        429,
        "TOO_MANY_REQUESTS"
      );
    }

    // 2. Generate token and dispatch via email only
    const { token } = await resendVerificationToken(validated.email);

    if (token) {
      await emailService.sendVerificationEmail(validated.email, token);
    }

    // 3. Generic response without leaking token
    return successResponse(
      {
        message: "If an account requiring verification exists for this email, verification instructions have been dispatched.",
      },
      "Verification email dispatched."
    );
  } catch (error) {
    return errorResponse(error, "Failed to resend verification email");
  }
}
