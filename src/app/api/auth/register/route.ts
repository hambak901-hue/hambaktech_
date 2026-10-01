import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth-service";
import { AUTH_CONFIG } from "@/lib/auth-constants";
import { ConflictError, ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      customerTier = "STANDARD",
      roleSlug = "customer",
    } = body;

    const trimmedFirstName = (firstName || "").trim();
    const trimmedLastName = (lastName || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedFirstName || !trimmedLastName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide both your First Name and Last Name.",
          },
        },
        { status: 400 }
      );
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid email address.",
          },
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters long.",
          },
        },
        { status: 400 }
      );
    }

    const result = await register({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      password,
      confirmPassword: body.confirmPassword || password,
      roleSlug: (roleSlug || "customer") as any,
      customerTier: (customerTier || "STANDARD") as any,
      termsAccepted: true,
    });


    const response = NextResponse.json(
      {
        success: true,
        message: "Customer account created successfully.",
        data: {
          user: result.sessionData.user,
          verificationToken: result.verificationToken,
          token: result.sessionData.sessionToken,
        },
      },
      { status: 201 }
    );

    if (result.sessionData.sessionToken) {
      response.cookies.set({
        name: AUTH_CONFIG.SESSION_COOKIE_NAME,
        value: result.sessionData.sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      response.cookies.set({
        name: "hambak_token",
        value: result.sessionData.sessionToken,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof ConflictError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: err.message,
          },
        },
        { status: 409 }
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
