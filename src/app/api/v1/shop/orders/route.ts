import { NextRequest } from "next/server";
import { requireAuth, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService, AdminService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const canManage =
      hasPermission(session, PERMISSIONS.ORDERS_READ) ||
      hasPermission(session, PERMISSIONS.ORDERS_MANAGE);

    if (canManage) {
      const orders = await AdminService.getOrders();
      const shopOrders = orders.filter((o) => o.serviceCategorySlug === "shop");
      return successResponse({ orders: shopOrders }, "Shop orders retrieved successfully");
    }

    const orders = await AdminService.getOrders(session.userId);
    const shopOrders = orders.filter((o) => o.serviceCategorySlug === "shop");
    return successResponse({ orders: shopOrders }, "Your shop orders retrieved successfully");
  } catch (error) {
    return errorResponse(error, "Failed to retrieve shop orders");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw new ValidationError("At least one product item is required.");
    }
    if (!body.deliveryZoneId) {
      throw new ValidationError("deliveryZoneId is required.");
    }

    const paymentMethod = body.paymentMethod || "WALLET";
    const allowedMethods = ["WALLET", "PAYSTACK", "MONIEPOINT", "BANK_TRANSFER"];
    if (!allowedMethods.includes(paymentMethod)) {
      throw new ValidationError(`Invalid payment method: ${paymentMethod}`);
    }

    const order = await ShopService.createShopOrder({
      userId: session.userId,
      userName: session.fullName || session.email,
      userEmail: session.email,
      userPhone: session.phone || body.phone,
      items: body.items.map((i: any) => ({
        productId: String(i.productId),
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
      })),
      deliveryZoneId: body.deliveryZoneId,
      deliveryAddress: body.deliveryAddress,
      paymentMethod,
      notes: body.notes,
    });

    return successResponse({ order }, "Shop order placed successfully.", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create shop order");
  }
}
