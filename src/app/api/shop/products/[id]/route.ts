import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService } from "@/lib/server/platform-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await ShopService.getProductById(id);
    if (!product) {
      return errorResponse(new Error(`Product not found: ${id}`), 404);
    }
    return successResponse(product, "Product retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, req);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await ShopService.updateProduct(id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Product not found: ${id}`), 404);
    }
    return successResponse(updated, "Product updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, req);
    const { id } = await context.params;

    const success = await ShopService.deleteProduct(id, session.userId);
    if (!success) {
      return errorResponse(new Error(`Product not found: ${id}`), 404);
    }
    return successResponse({ deleted: true }, "Product deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
