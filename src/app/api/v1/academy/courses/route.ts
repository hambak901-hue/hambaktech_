import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const courses = await AcademyService.getCourses();
    return successResponse({ courses });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve courses");
  }
}
