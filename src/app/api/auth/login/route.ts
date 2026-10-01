import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth-service";
import { AUTH_CONFIG } from "@/lib/auth-constants";
import { UnauthorizedError, ValidationError, ForbiddenError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, credential, password, rememberMe = false } = body;

    const identifier = (email || credential || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email/phone and password are required.",
          },
        },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await login(
      {
        credential: identifier,
        password,
        rememberMe: !!rememberMe,
      },
      {
        ipAddress,
        userAgent,
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: {
        user: result.user,
        token: result.sessionToken,
      },
    });

    const maxAge = rememberMe
      ? 30 * 24 * 60 * 60
      : (AUTH_CONFIG.SESSION_EXPIRATION_DAYS || 7) * 24 * 3600;


    response.cookies.set({
      name: AUTH_CONFIG.SESSION_COOKIE_NAME,
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set({
      name: "hambak_token",
      value: result.sessionToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: err.message,
          },
        },
        { status: 401 }
      );
    }

    if (err instanceof ForbiddenError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: err.message,
          },
        },
        { status: 403 }
      );
    }

    if (err instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: err.message,
          },
        },
        { status: 400 }
      );
    }

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
