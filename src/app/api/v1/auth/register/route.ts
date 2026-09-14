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
        token: sessionData.sessionToken,
        tokenType: "Bearer",
        expiresAt: sessionData.expiresAt.toISOString(),
        verificationToken,
      },
      "Account registered successfully.",
      201
    );

    setSessionCookie(response, sessionData.sessionToken, sessionData.expiresAt);
    return response;
  } catch (error) {
    return errorResponse(error, "Registration failed");
  }
}
