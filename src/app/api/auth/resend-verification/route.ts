import { NextRequest } from "next/server";
import { resendVerificationToken } from "@/lib/auth-service";
import { validateData, ResendVerificationSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateData(ResendVerificationSchema, body);

    const { token } = await resendVerificationToken(validated.email);

    return successResponse(
      {
        message: "If your account requires verification, a new link has been dispatched.",
        verificationToken: token,
      },
      "Verification email dispatched."
    );
  } catch (error) {
    return errorResponse(error, "Failed to resend verification email");
  }
}
