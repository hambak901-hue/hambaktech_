import { NextRequest } from "next/server";
import { logout } from "@/lib/auth-service";
import { extractSessionToken, clearSessionCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await logout(token);
    }

    const response = successResponse(
      { loggedOut: true },
      "Logged out successfully."
    );

    clearSessionCookie(response);
    return response;
  } catch (error) {
    return errorResponse(error, "Logout failed");
  }
}
