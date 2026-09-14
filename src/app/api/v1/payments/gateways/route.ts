import { successResponse, errorResponse } from "@/lib/api-response";
import { PaymentService } from "@/lib/server/platform-store";

export async function GET() {
  try {
    const gateways = await PaymentService.getActiveGateways();
    return successResponse({ gateways });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve payment gateways");
  }
}
