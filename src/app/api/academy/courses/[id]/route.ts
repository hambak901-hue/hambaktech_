import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const course = await AcademyService.getCourseById(id);
    if (!course) {
      return errorResponse(new Error(`Course not found: ${id}`), 404);
    }
    return successResponse(course, "Course retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await AcademyService.updateCourse(id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Course not found: ${id}`), 404);
    }
    return successResponse(updated, "Course updated successfully");
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

    const success = await AcademyService.deleteCourse(id, session.userId);
    if (!success) {
      return errorResponse(new Error(`Course not found: ${id}`), 404);
    }
    return successResponse({ deleted: true }, "Course deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
