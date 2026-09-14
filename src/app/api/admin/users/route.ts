import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.USERS_READ, req);
    const users = await AdminService.getUsers();
    return successResponse(users, "Users retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_MANAGE, req);
    const body = await req.json();

    if (!body.userId) {
      return errorResponse(new Error("userId is required"), 400);
    }

    const updated = await AdminService.updateUser(body.userId, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`User not found: ${body.userId}`), 404);
    }

    return successResponse(updated, "User updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
