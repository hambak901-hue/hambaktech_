import { NextRequest } from "next/server";
import { ServicesCatalogService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.serviceId) {
      throw new ValidationError("serviceId is required for pricing calculation.");
    }

    const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
    const customerTier = body.customerTier || "STANDARD";

    const calculation = await ServicesCatalogService.calculatePrice(
      body.serviceId,
      customerTier,
      quantity
    );

    return successResponse(calculation, "Price calculated authoritatively.");
  } catch (error) {
    return errorResponse(error, "Failed to calculate price");
  }
}
