import { NextRequest } from "next/server";
import { ServicesCatalogService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const services = await ServicesCatalogService.getServices(category);
    return successResponse({ services });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve services");
  }
}
