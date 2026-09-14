import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { OrderService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;
    const isAdmin = ["admin", "super_admin"].includes(session.role);

    const order = await OrderService.getOrderById(id, session.userId, isAdmin);
    if (!order) {
      throw new NotFoundError(`Order '${id}' was not found.`);
    }

    return successResponse({ order });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve order details");
  }
}
