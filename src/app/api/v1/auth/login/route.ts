import { NextRequest } from "next/server";
import { login } from "@/lib/auth-service";
import { validateData, LoginSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { AuditService } from "@/lib/server/platform-store";

export async function POST(req: NextRequest) {
  // 1. Enforce CSRF verification for browser contexts
  verifyCsrf(req);

  // 2. Parse and validate body
  let validated: any;
  try {
    const body = await req.json();
    validated = validateData(LoginSchema, body);
  } catch (err) {
    return errorResponse(err, "Invalid login credentials format");
  }

  // 3. Enforce Rate Limiting (per IP and per credential)
  const rateLimit = enforceRateLimit(req, "AUTH_LOGIN", validated.credential);
  if (!rateLimit.success) {
    AuditService.log({
      actorName: "ANONYMOUS",
      actorEmail: validated.credential,
      role: "customer",
      action: "AUTH_LOGIN_RATE_LIMITED",
      entity: "USER_AUTH",
      entityId: validated.credential,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      status: "WARNING",
      metadata: { reason: "Rate limit exceeded (5 attempts per 15 minutes)" },
    });

    const resp = errorResponse(
      new Error("Too many failed login attempts. Please wait 15 minutes or reset your password."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  try {
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const sessionData = await login(validated, {
      ipAddress,
      userAgent,
    });

    AuditService.log({
      actorName: sessionData.user.profile?.firstName
        ? `${sessionData.user.profile.firstName} ${sessionData.user.profile.lastName || ""}`
        : sessionData.user.email,
      actorEmail: sessionData.user.email,
      role: sessionData.user.role.slug as any,
      action: "AUTH_LOGIN_SUCCESS",
      entity: "USER_SESSION",
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
      },
      "Authentication successful."
    );

    // Attach rate limit headers
    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));

    // Support both mobile token storage and cookie-based browsers/web-views
    setSessionCookie(response, sessionData.sessionToken, sessionData.expiresAt);
    return response;
  } catch (error) {
    AuditService.log({
      actorName: "UNKNOWN",
      actorEmail: validated.credential,
      role: "customer",
      action: "AUTH_LOGIN_FAILED",
      entity: "USER_AUTH",
      entityId: validated.credential,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      status: "FAILED",
    });

    const resp = errorResponse(error, "Authentication failed");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
