import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { AcademyService } from "@/lib/server/platform-store";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.enrollmentId || !body.lessonId) {
      return errorResponse(new Error("enrollmentId and lessonId are required"), "Missing required fields", 400);
    }

    const updated = await AcademyService.updateProgress(
      body.enrollmentId,
      body.lessonId,
      body.moduleId || 1
    );

    if (!updated) {
      return errorResponse(new Error("Enrollment not found"), "Enrollment record not found", 404);
    }

    return successResponse(
      { enrollment: updated },
      updated.progressPercent >= 100
        ? "Congratulations! You have completed the course curriculum and your certificate has been generated."
        : "Lesson progress saved."
    );
  } catch (error) {
    return errorResponse(error, "Failed to update lesson progress");
  }
}
