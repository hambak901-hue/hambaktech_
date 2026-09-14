import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await ShopService.getProductCategories();
    return successResponse({ categories });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve shop categories");
  }
}
