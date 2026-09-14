import { NextRequest } from "next/server";
import { verifyEmail } from "@/lib/auth-service";
import { validateData, VerifyEmailSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, "AUTH_VERIFY_EMAIL");
    if (!rateLimit.success) {
      return errorResponse(
        new Error("Too many verification attempts. Please wait before trying again."),
        429,
        "TOO_MANY_REQUESTS"
      );
    }

    const body = await req.json();
    const validated = validateData(VerifyEmailSchema, body);

    const { email } = await verifyEmail(validated.token);

    return successResponse(
      { email },
      "Email address verified successfully. Your account is now active."
    );
  } catch (error) {
    return errorResponse(error, "Email verification failed");
  }
}
