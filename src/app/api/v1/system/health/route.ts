import { MobileSystemService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const health = await MobileSystemService.getHealthStatus();
    return successResponse(health);
  } catch (error) {
    return errorResponse(error, "Failed to retrieve system health status");
  }
}
