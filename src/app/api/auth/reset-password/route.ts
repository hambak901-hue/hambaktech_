import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth-service";
import { ValidationError, NotFoundError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = (body?.token || body?.otp)?.trim();
    const newPassword = (body?.newPassword || body?.password)?.trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Verification token or OTP code is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New password must be at least 8 characters long.",
          },
        },
        { status: 400 }
      );
    }

    await resetPassword(token, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You may now sign in.",
    });
  } catch (err: unknown) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
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
