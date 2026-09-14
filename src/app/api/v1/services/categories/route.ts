import { ServicesCatalogService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await ServicesCatalogService.getCategories();
    return successResponse({ categories });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve service categories");
  }
}
