import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.SETTINGS_MANAGE, req);
    const settings = await AdminService.getSystemSettings();
    return successResponse(settings, "System settings retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE, req);
    const body = await req.json();

    const updated = await AdminService.updateSystemSettings(body, session.userId);
    return successResponse(updated, "System settings updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
