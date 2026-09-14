import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const canManage = hasPermission(session, PERMISSIONS.ACADEMY_READ) || hasPermission(session, PERMISSIONS.ACADEMY_MANAGE);

    // If admin/staff with permission, can filter by student or see all; otherwise only see own
    const { searchParams } = new URL(req.url);
    const filterUserId = searchParams.get("userId");

    if (canManage && filterUserId) {
      const enrollments = await AcademyService.getEnrollments(filterUserId);
      return successResponse(enrollments, "Enrollments retrieved successfully");
    } else if (canManage && !filterUserId) {
      const enrollments = await AcademyService.getEnrollments();
      return successResponse(enrollments, "All enrollments retrieved successfully");
    } else {
      const enrollments = await AcademyService.getEnrollments(session.userId);
      return successResponse(enrollments, "Your enrollments retrieved successfully");
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.courseId) {
      return errorResponse(new Error("courseId is required"), 400);
    }

    const result = await AcademyService.enrollStudent({
      userId: session.userId,
      courseId: body.courseId,
      studentName: session.fullName || body.studentName || session.email.split("@")[0],
      studentEmail: session.email,
      studentPhone: body.studentPhone || session.phone || undefined,
      cohort: body.cohort,
      payWithWallet: body.payWithWallet !== false,
    });

    return successResponse(
      result,
      result.walletDeducted
        ? "Enrollment successful and tuition fee deducted from wallet."
        : "Enrollment successful.",
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
