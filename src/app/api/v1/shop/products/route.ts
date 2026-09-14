import { NextRequest } from "next/server";
import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = (searchParams.get("search") || searchParams.get("q"))?.toLowerCase().trim();

    let products = await ShopService.getProducts(categoryId);

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.shortDescription?.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search)
      );
    }

    return successResponse({ products });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve shop products");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, req);
    const body = await req.json();

    if (!body.name || !body.sku || body.sellingPrice === undefined) {
      return errorResponse(new Error("name, sku, and sellingPrice are required"), "Missing required product fields", 400);
    }

    const newProduct = await ShopService.createProduct(body, session.userId);
    return successResponse({ product: newProduct }, "Product created successfully", 201);
  } catch (error) {
    return errorResponse(error, "Failed to create product");
  }
}
