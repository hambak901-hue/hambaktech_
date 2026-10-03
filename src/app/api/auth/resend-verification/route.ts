import { NextRequest, NextResponse } from "next/server";
import { resendVerificationToken } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email address is required.",
          },
        },
        { status: 400 }
      );
    }

    const result = await resendVerificationToken(email);

    return NextResponse.json({
      success: true,
      message: "If an unverified account exists, a new verification link has been dispatched.",
      data: {
        email,
        verificationToken: result.token,
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
