import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.courseId) {
      throw new ValidationError("courseId is required for enrollment.");
    }

    const { enrollment, walletDeducted } = await AcademyService.enrollStudent({
      userId: session.userId,
      courseId: body.courseId,
      studentName: session.fullName || session.email,
      studentEmail: session.email,
      studentPhone: session.phone || body.phone,
      cohort: body.cohort || "Upcoming 2026 Batch",
      payWithWallet: body.payWithWallet !== false,
    });

    return successResponse(
      { enrollment, walletDeducted },
      walletDeducted
        ? "Enrolled successfully! Tuition paid via wallet."
        : "Enrollment submitted successfully. Awaiting payment.",
      201
    );
  } catch (error) {
    return errorResponse(error, "Enrollment failed");
  }
}
