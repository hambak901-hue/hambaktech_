import { NextRequest } from "next/server";
import { requireAuth, extractSessionToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, "AUTH_REFRESH");
    if (!rateLimit.success) {
      return errorResponse(
        new Error("Too many refresh requests. Please wait before refreshing your session."),
        429,
        "TOO_MANY_REQUESTS"
      );
    }

    const session = await requireAuth(req);
    const token = extractSessionToken(req);

    const refreshedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return successResponse({
      token,
      tokenType: "Bearer",
      expiresAt: refreshedExpiry.toISOString(),
      user: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      },
    }, "Session token refreshed successfully.");
  } catch (error) {
    return errorResponse(error, "Session refresh failed");
  }
}
