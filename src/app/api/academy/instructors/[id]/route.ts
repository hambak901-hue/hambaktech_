import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await AcademyService.updateInstructor(id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Instructor not found: ${id}`), 404);
    }
    return successResponse(updated, "Instructor updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const { id } = await context.params;

    const success = await AcademyService.deleteInstructor(id, session.userId);
    if (!success) {
      return errorResponse(new Error(`Instructor not found: ${id}`), 404);
    }
    return successResponse({ deleted: true }, "Instructor deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
