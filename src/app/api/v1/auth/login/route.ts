import { NextRequest } from "next/server";
import { login } from "@/lib/auth-service";
import { validateData, LoginSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateData(LoginSchema, body);

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const sessionData = await login(validated, {
      ipAddress,
      userAgent,
    });

    const response = successResponse(
      {
        user: sessionData.user,
        token: sessionData.sessionToken,
        tokenType: "Bearer",
        expiresAt: sessionData.expiresAt.toISOString(),
      },
      "Authentication successful."
    );

    // Support both mobile token storage and cookie-based browsers/web-views
    setSessionCookie(response, sessionData.sessionToken, sessionData.expiresAt);
    return response;
  } catch (error) {
    return errorResponse(error, "Authentication failed");
  }
}
