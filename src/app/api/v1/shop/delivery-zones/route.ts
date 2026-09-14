import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const zones = await ShopService.getDeliveryZones();
    return successResponse({ zones });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve delivery zones");
  }
}
