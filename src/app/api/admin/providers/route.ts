import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.SETTINGS_MANAGE, req);
    const providers = await AdminService.getProviders();
    return successResponse(providers, "System providers retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE, req);
    const body = await req.json();

    if (!body.id) {
      return errorResponse(new Error("Provider id is required"), 400);
    }

    const updated = await AdminService.updateProvider(body.id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Provider not found: ${body.id}`), 404);
    }

    return successResponse(updated, "Provider updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
