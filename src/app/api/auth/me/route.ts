import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth-service";
import { AUTH_CONFIG } from "@/lib/auth-constants";

export async function GET(req: NextRequest) {
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

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "No active session found.",
          },
        },
        { status: 401 }
      );
    }

    const user = await validateSession(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Session is invalid or expired.",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });
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
