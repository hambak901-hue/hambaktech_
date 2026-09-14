import { NextRequest } from "next/server";
import { register } from "@/lib/auth-service";
import { validateData, RegisterSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { AuditService } from "@/lib/server/platform-store";

export async function POST(req: NextRequest) {
  // 1. Enforce CSRF verification for browser contexts
  verifyCsrf(req);

  // 2. Enforce Rate Limiting (3 registrations per hour per IP)
  const rateLimit = enforceRateLimit(req, "AUTH_REGISTER");
  if (!rateLimit.success) {
    const resp = errorResponse(
      new Error("Registration limit exceeded. Please try again later."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

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

    AuditService.log({
      actorName: `${validated.firstName} ${validated.lastName}`,
      actorEmail: validated.email,
      role: "customer",
      action: "AUTH_REGISTER_SUCCESS",
      entity: "USER_ACCOUNT",
      entityId: sessionData.user.id,
      ipAddress: ipAddress || "127.0.0.1",
      status: "SUCCESS",
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

    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));
    setSessionCookie(response, sessionData.sessionToken, sessionData.expiresAt);
    return response;
  } catch (error) {
    const resp = errorResponse(error, "Registration failed");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
