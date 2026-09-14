import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, requirePermission, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const canManage = hasPermission(session, PERMISSIONS.ACADEMY_READ) || hasPermission(session, PERMISSIONS.ACADEMY_MANAGE);

    if (canManage) {
      const cards = await AcademyService.getIdCards();
      return successResponse(cards, "Student ID cards retrieved successfully");
    }

    const cards = await AcademyService.getIdCards(session.userId);
    return successResponse(cards, "Your student ID cards retrieved successfully");
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

    const card = await AcademyService.issueIdCard(body.enrollmentId, session.userId);
    return successResponse(card, "Student ID card issued successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}
