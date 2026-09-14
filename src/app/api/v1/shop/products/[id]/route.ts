import { NextRequest } from "next/server";
import { ShopService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await ShopService.getProductById(id);

    if (!product) {
      throw new NotFoundError(`Product '${id}' not found.`);
    }

    return successResponse({ product });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve product details");
  }
}
