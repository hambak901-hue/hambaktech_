import { NextResponse } from "next/server";
import { AppError } from "./errors";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

/**
 * Standardized Success Response Helper
 */
export function successResponse<T>(
  data: T,
  message = "Operation successful",
  statusCode = 200,
  meta?: Omit<NonNullable<ApiResponse["meta"]>, "timestamp">
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Standardized Error Response Helper
 */
export function errorResponse(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): NextResponse<ApiResponse<null>> {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: { timestamp },
      },
      { status: error.statusCode }
    );
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
      },
      meta: { timestamp },
    },
    { status: 500 }
  );
}
