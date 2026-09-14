import { NextRequest } from "next/server";
import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search")?.toLowerCase().trim();

    let products = await ShopService.getProducts(categoryId);

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search)
      );
    }

    return successResponse({ products });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve shop products");
  }
}
