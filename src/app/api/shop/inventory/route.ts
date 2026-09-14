import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.INVENTORY_READ, req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const logs = await ShopService.getInventoryLogs(productId || undefined);
    return successResponse(logs, "Inventory logs retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.INVENTORY_MANAGE, req);
    const body = await req.json();

    if (!body.productId || !body.changeType || body.quantity === undefined) {
      return errorResponse(new Error("productId, changeType, and quantity are required"), 400);
    }

    const updatedProduct = await ShopService.adjustStock(
      body.productId,
      body.changeType,
      Number(body.quantity),
      body.notes,
      session.userId,
      session.fullName || session.email
    );

    return successResponse(updatedProduct, "Inventory stock adjusted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
