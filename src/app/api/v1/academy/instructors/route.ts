import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET() {
  try {
    const instructors = await AcademyService.getInstructors();
    return successResponse({ instructors }, "Instructors retrieved successfully");
  } catch (error) {
    return errorResponse(error, "Failed to retrieve instructors");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const body = await req.json();

    if (!body.name || !body.title) {
      return errorResponse(new Error("Instructor name and title are required"), "Missing required fields", 400);
    }

    const instructor = await AcademyService.createInstructor(body, session.userId);
    return successResponse({ instructor }, "Instructor created successfully", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create instructor");
  }
}
