import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { validateUploadFile } from "@/lib/file-security";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { AppError } from "@/lib/errors";
import { AuditService } from "@/lib/server/platform-store";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting check
    const rateLimit = enforceRateLimit(req, "FILE_UPLOAD");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Upload rate limit exceeded. Please wait before uploading more files.",
          },
        },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // 2. CSRF Verification for browser contexts
    verifyCsrf(req);

    // 3. Authentication Check
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to upload files.",
          },
        },
        { status: 401 }
      );
    }

    // 4. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string) || "GENERAL";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No file provided in the 'file' form field.",
          },
        },
        { status: 422 }
      );
    }

    // 5. Extract file bytes & validate
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateUploadFile(
      file.name,
      file.type,
      buffer.length,
      buffer
    );

    // 6. Formulate secure public path
    const fileUrl = `/uploads/${validation.safeFilename}`;

    // 7. Audit log the upload action
    AuditService.log({
      actorName: session.fullName || session.email,
      actorEmail: session.email,
      role: session.role as any,
      action: "FILE_UPLOADED",
      entity: "FILE_UPLOAD",
      entityId: validation.safeFilename,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      status: "SUCCESS",
      metadata: {
        originalName: file.name,
        safeFilename: validation.safeFilename,
        sizeBytes: buffer.length,
        mimeType: file.type,
        purpose,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: fileUrl,
          filename: validation.safeFilename,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: buffer.length,
          purpose,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201, headers: rateLimit.headers }
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred during file upload.",
        },
      },
      { status: 500 }
    );
  }
}
