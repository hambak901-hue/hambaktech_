import { NextRequest } from "next/server";
import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await AcademyService.getCourseById(id);

    if (!course) {
      throw new NotFoundError(`Course '${id}' not found.`);
    }

    return successResponse({ course });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve course");
  }
}
