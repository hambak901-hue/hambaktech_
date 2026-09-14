import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, requirePermission, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const canManage = hasPermission(session, PERMISSIONS.ACADEMY_READ) || hasPermission(session, PERMISSIONS.ACADEMY_MANAGE);

    const allCertificates = await AcademyService.getCertificates();
    if (canManage) {
      return successResponse(allCertificates, "Certificates retrieved successfully");
    }

    // For student/customer, filter to certificates matching their name or enrolled courses
    const studentEnrollments = await AcademyService.getEnrollments(session.userId);
    const enrollmentIds = new Set(studentEnrollments.map((e) => e.id));
    const certs = allCertificates.filter((c) => enrollmentIds.has(c.enrollmentId));

    return successResponse(certs, "Your certificates retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const body = await req.json();

    if (!body.enrollmentId) {
      return errorResponse(new Error("enrollmentId is required"), 400);
    }

    const cert = await AcademyService.issueCertificate(
      body.enrollmentId,
      body.grade || "Distinction",
      session.fullName || "Engr. Hammed Bakare"
    );

    return successResponse(cert, "Certificate issued successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}
