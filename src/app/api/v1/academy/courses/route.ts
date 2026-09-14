import { NextRequest } from "next/server";
import { AcademyService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    let courses = await AcademyService.getCourses();
    if (category) {
      courses = courses.filter((c) => c.categoryId === category || c.categoryName?.toLowerCase().includes(category.toLowerCase()));
    }
    if (level) {
      courses = courses.filter((c) => c.level.toLowerCase() === level.toLowerCase());
    }

    return successResponse({ courses });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve courses");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.ACADEMY_MANAGE, req);
    const body = await req.json();

    if (!body.title || !body.code || !body.tuitionFee) {
      return errorResponse(new Error("Title, code, and tuition fee are required"), "Missing required fields", 400);
    }

    const newCourse = await AcademyService.createCourse(body, session.userId);
    return successResponse({ course: newCourse }, "Course created successfully", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create course");
  }
}
