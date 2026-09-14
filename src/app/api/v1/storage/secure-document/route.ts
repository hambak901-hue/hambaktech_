import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { ROLES } from "@/lib/auth-constants";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required to access secure documents." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawKey = searchParams.get("key");
    if (!rawKey) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "File key query parameter is required." } },
        { status: 422 }
      );
    }

    // Sanitize key and guard against traversal
    const safeKey = path.basename(rawKey).replace(/[^a-zA-Z0-9._-]/g, "_");
    const vaultDir = path.resolve(process.cwd(), "storage", "secure_vault");
    const filePath = path.resolve(vaultDir, safeKey);

    if (!filePath.startsWith(vaultDir) || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Requested secure document was not found." } },
        { status: 404 }
      );
    }

    // Check authorization: staff, admin, or super_admin have access
    const isPrivileged = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF].includes(session.role as any);
    if (!isPrivileged) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions to inspect secure vault documents." } },
        { status: 403 }
      );
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(safeKey).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeKey}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to retrieve secure document." } },
      { status: 500 }
    );
  }
}
