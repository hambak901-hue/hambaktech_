import { NextRequest } from "next/server";
import { verifyEmail } from "@/lib/auth-service";
import { validateData, VerifyEmailSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { TooManyRequestsError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, "AUTH_VERIFY_EMAIL");
    if (!rateLimit.success) {
      const resp = errorResponse(
        new TooManyRequestsError("Too many verification attempts. Please wait before trying again.")
      );
      Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
      return resp;
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
