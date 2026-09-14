import { NextRequest } from "next/server";
import { register } from "@/lib/auth-service";
import { validateData, RegisterSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateData(RegisterSchema, body);

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const { sessionData, verificationToken } = await register(validated, {
      ipAddress,
      userAgent,
    });

    const response = successResponse(
      {
        user: sessionData.user,
        sessionToken: sessionData.sessionToken,
        verificationToken, // Provided for user convenience and development inspection
      },
      "Account registered successfully. Please verify your email.",
      201
    );

    setSessionCookie(response, sessionData.sessionToken, sessionData.expiresAt);
    return response;
  } catch (error) {
    return errorResponse(error, "Registration failed");
  }
}
