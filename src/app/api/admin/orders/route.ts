import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.ORDERS_READ, req);
    const orders = await AdminService.getOrders();
    return successResponse(orders, "All platform orders retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.ORDERS_UPDATE, req);
    const body = await req.json();

    if (!body.orderId || !body.status) {
      return errorResponse(new Error("orderId and status are required"), 400);
    }

    const updated = await AdminService.updateOrderStatus(
      body.orderId,
      body.status,
      body.note,
      session.fullName || session.email
    );

    if (!updated) {
      return errorResponse(new Error(`Order not found: ${body.orderId}`), 404);
    }

    return successResponse(updated, "Order status updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
