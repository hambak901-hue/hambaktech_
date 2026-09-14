import { NextRequest } from "next/server";
import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";

export async function GET() {
  try {
    const categories = await ShopService.getProductCategories();
    return successResponse({ categories });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve shop categories");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE, req);
    const body = await req.json();

    if (!body.name || !body.code) {
      return errorResponse(new Error("Category name and code are required"), "Missing required fields", 400);
    }

    const newCategory = await ShopService.createProductCategory(body, session.userId);
    return successResponse({ category: newCategory }, "Product category created successfully", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create category");
  }
}
