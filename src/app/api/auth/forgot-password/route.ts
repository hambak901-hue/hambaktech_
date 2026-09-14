import { NextRequest } from "next/server";
import { requestPasswordReset } from "@/lib/auth-service";
import { validateData, ForgotPasswordSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateData(ForgotPasswordSchema, body);

    const { token } = await requestPasswordReset(validated.email);

    return successResponse(
      {
        message: "If an account exists with this email, a password reset link has been dispatched.",
        // For development/preview convenience, expose token if generated:
        resetToken: token,
      },
      "Password reset instructions have been generated."
    );
  } catch (error) {
    return errorResponse(error, "Password recovery failed");
  }
}
