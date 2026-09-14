import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService } from "@/lib/server/platform-store";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE, req);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await ShopService.updateProductCategory(id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Product category not found: ${id}`), 404);
    }
    return successResponse(updated, "Product category updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE, req);
    const { id } = await context.params;

    const success = await ShopService.deleteProductCategory(id, session.userId);
    if (!success) {
      return errorResponse(new Error(`Product category not found: ${id}`), 404);
    }
    return successResponse({ deleted: true }, "Product category deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
