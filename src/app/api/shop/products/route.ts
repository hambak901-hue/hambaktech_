import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { ShopService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("q");

    let products = await ShopService.getProducts(categoryId || undefined);

    if (query) {
      const q = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    return successResponse(products, "Products retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE, req);
    const body = await req.json();

    if (!body.name || !body.sku || body.sellingPrice === undefined) {
      return errorResponse(new Error("name, sku, and sellingPrice are required"), 400);
    }

    const newProduct = await ShopService.createProduct(body, session.userId);
    return successResponse(newProduct, "Product created successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}
