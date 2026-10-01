import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth-service";
import { ValidationError, NotFoundError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Verification token is required.",
          },
        },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully.",
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
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
