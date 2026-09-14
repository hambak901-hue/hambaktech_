import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService, AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const canManage =
      hasPermission(session, PERMISSIONS.ORDERS_READ) ||
      hasPermission(session, PERMISSIONS.ORDERS_MANAGE);

    if (canManage) {
      const orders = await AdminService.getOrders();
      const shopOrders = orders.filter((o) => o.serviceCategorySlug === "shop");
      return successResponse(shopOrders, "Shop orders retrieved successfully");
    }

    const orders = await AdminService.getOrders(session.userId);
    const shopOrders = orders.filter((o) => o.serviceCategorySlug === "shop");
    return successResponse(shopOrders, "Your shop orders retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse(new Error("At least one cart item is required"), 400);
    }

    if (!body.deliveryZoneId) {
      return errorResponse(new Error("deliveryZoneId is required"), 400);
    }

    const order = await ShopService.createShopOrder({
      userId: session.userId,
      userName: session.fullName || body.userName || session.email.split("@")[0],
      userEmail: session.email,
      userPhone: body.userPhone || session.phone || undefined,
      items: body.items,
      deliveryZoneId: body.deliveryZoneId,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod || "WALLET",
      notes: body.notes,
    });

    return successResponse(order, "Order placed successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}
