import { NextRequest } from "next/server";
import { verifyEmail } from "@/lib/auth-service";
import { validateData, VerifyEmailSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
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
