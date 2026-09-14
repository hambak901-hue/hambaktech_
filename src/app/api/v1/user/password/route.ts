import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { changePassword } from "@/lib/auth-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { validateData, ChangePasswordSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { AuditService } from "@/lib/server/platform-store";

export async function POST(req: NextRequest) {
  // 1. Enforce CSRF check for browser sessions
  verifyCsrf(req);

  // 2. Enforce Rate Limiting (5 attempts per hour per client)
  const rateLimit = enforceRateLimit(req, "AUTH_RESET_PASSWORD");
  if (!rateLimit.success) {
    const resp = errorResponse(
      new Error("Password change attempts exceeded. Please try again later."),
      "Too many requests",
      429
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const validated = validateData(ChangePasswordSchema, body);

    await changePassword(session.userId, validated.currentPassword, validated.newPassword);

    AuditService.log({
      actorName: session.fullName || session.email,
      actorEmail: session.email,
      role: (typeof session.role === "string" ? session.role : (session.role as any)?.slug) as any,
      action: "AUTH_PASSWORD_CHANGED",
      entity: "USER_SECURITY",
      entityId: session.userId,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      status: "SUCCESS",
    });

    const response = successResponse(
      { updated: true },
      "Password changed successfully. All previous sessions have been invalidated."
    );
    Object.entries(rateLimit.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    const resp = errorResponse(error, "Failed to change password");
    Object.entries(rateLimit.headers).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }
}
