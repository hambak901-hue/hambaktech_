import { NextRequest } from "next/server";
import { ServicesCatalogService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const service = await ServicesCatalogService.getServiceBySlug(slug);

    if (!service) {
      throw new NotFoundError(`Service with slug/id '${slug}' not found.`);
    }

    return successResponse({ service });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve service");
  }
}
