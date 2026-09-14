import { MobileSystemService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const config = await MobileSystemService.getAppConfig();
    return successResponse(config);
  } catch (error) {
    return errorResponse(error, "Failed to retrieve mobile system configuration");
  }
}
