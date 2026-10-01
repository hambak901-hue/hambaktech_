import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth-service";
import { AUTH_CONFIG } from "@/lib/auth-constants";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      token =
        req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value ||
        req.cookies.get("hambak_token")?.value ||
        req.cookies.get("session_token")?.value;
    }

    if (token) {
      await logout(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully signed out.",
    });

    response.cookies.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);
    response.cookies.delete("hambak_token");
    response.cookies.delete("session_token");

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
