import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const enrollments = await AcademyService.getEnrollments(session.userId);

    return successResponse({ enrollments });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve enrollments");
  }
}
