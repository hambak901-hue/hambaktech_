import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const { id: submissionId } = await context.params;
    const body = await req.json();

    if (body.score === undefined || !body.grade) {
      return errorResponse(new Error("score and grade are required"), 400);
    }

    const graded = await AcademyService.gradeSubmission(
      submissionId,
      {
        score: Number(body.score),
        grade: body.grade,
        feedback: body.feedback || "Good work.",
      },
      session.fullName || session.email
    );

    if (!graded) {
      return errorResponse(new Error(`Submission not found: ${submissionId}`), 404);
    }

    return successResponse(graded, "Submission graded successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
