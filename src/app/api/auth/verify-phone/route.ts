import { NextRequest, NextResponse } from "next/server";
import { verifyPhone, requestPhoneOtp } from "@/lib/auth-service";
import { ValidationError, NotFoundError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action || "verify";
    const phone = (body?.phone || body?.email)?.trim();
    const otp = body?.otp?.trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Phone number or email is required.",
          },
        },
        { status: 400 }
      );
    }

    if (action === "request_otp") {
      const result = await requestPhoneOtp(phone);
      return NextResponse.json({
        success: true,
        message: result.message,
        data: { otp: result.otp, phone },
      });
    }

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "6-digit verification code is required.",
          },
        },
        { status: 400 }
      );
    }

    const result = await verifyPhone(phone, otp);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
      data: result,
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
