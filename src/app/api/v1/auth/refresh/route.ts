import { NextRequest } from "next/server";
import { requireAuth, extractSessionToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
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
