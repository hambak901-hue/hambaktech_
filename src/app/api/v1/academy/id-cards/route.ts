import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const idCards = await AcademyService.getIdCards(session.userId);

    return successResponse({ idCards });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve student ID cards");
  }
}
