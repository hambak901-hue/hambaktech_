import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ShopService } from "@/lib/server/platform-store";

export async function GET() {
  try {
    const zones = await ShopService.getDeliveryZones();
    return successResponse(zones, "Delivery zones retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
