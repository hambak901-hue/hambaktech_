import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AuditService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ, req);
    const logs = AuditService.getLogs();
    return successResponse(logs, "Audit logs retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
