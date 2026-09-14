import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.REPORTS_READ, req);
    const stats = await AdminService.getReportsStats();
    return successResponse(stats, "Platform reports statistics retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
