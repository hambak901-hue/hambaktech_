import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const assignments = await AcademyService.getAssignments(courseId || undefined);
    return successResponse(assignments, "Assignments retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.assignmentId || !body.enrollmentId || !body.content) {
      return errorResponse(new Error("assignmentId, enrollmentId, and content are required"), 400);
    }

    const submission = await AcademyService.submitAssignment({
      assignmentId: body.assignmentId,
      enrollmentId: body.enrollmentId,
      studentId: session.userId,
      studentName: session.fullName || session.email.split("@")[0],
      content: body.content,
      fileUrl: body.fileUrl,
    });

    return successResponse(submission, "Assignment submitted successfully for instructor review", 201);
  } catch (error) {
    return errorResponse(error);
  }
}
