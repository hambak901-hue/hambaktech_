import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();
    const otp = body?.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and verification code are required.",
          },
        },
        { status: 400 }
      );
    }

    const isValid = await verifyOtpCode(email, otp);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_OTP",
            message: "The verification code is invalid or has expired.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
      data: { verified: true },
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
