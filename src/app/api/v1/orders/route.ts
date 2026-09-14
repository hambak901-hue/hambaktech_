import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { OrderService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { OrderStatus } from "@/types/platform";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const status = searchParams.get("status") as OrderStatus | null;

    // Admins can see all or specify a userId; regular users only see their own
    const isAdmin = ["admin", "super_admin"].includes(session.role);
    const filterUserId = isAdmin ? (searchParams.get("userId") || undefined) : session.userId;

    let orders = await OrderService.getOrders(filterUserId, status || undefined);

    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginated = orders.slice(startIndex, startIndex + limit);

    return successResponse({
      orders: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve orders");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    if (!body.serviceTitle || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw new ValidationError("Order must specify serviceTitle and at least one item.");
    }

    const paymentMethod = body.paymentMethod || "WALLET";
    const allowedMethods = ["WALLET", "PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"];
    if (!allowedMethods.includes(paymentMethod)) {
      throw new ValidationError(`Invalid payment method: ${paymentMethod}`);
    }

    // Clean and validate items
    const sanitizedItems = body.items.map((item: any) => ({
      title: String(item.title || "Service item"),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      serviceId: item.serviceId ? String(item.serviceId) : undefined,
    }));

    const order = await OrderService.createServiceOrder({
      userId: session.userId,
      userName: session.fullName || session.email,
      userEmail: session.email,
      userPhone: session.phone || body.phone,
      serviceCategorySlug: body.serviceCategorySlug || "services",
      serviceCategoryName: body.serviceCategoryName || "Digital Services",
      serviceTitle: body.serviceTitle,
      items: sanitizedItems,
      paymentMethod,
      notes: body.notes,
    });

    return successResponse({
      order,
    }, "Order created successfully.", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create order");
  }
}
