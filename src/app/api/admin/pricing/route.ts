import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/auth-constants";
import { AdminService } from "@/lib/server/platform-store";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.PRICING_READ, req);
    const pricing = await AdminService.getPricingRules();
    return successResponse(pricing, "Pricing rules retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.PRICING_MANAGE, req);
    const body = await req.json();

    const rule = await AdminService.createPricingRule(body, session.userId);
    return successResponse(rule, "Pricing rule created successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.PRICING_MANAGE, req);
    const body = await req.json();

    if (!body.id) {
      return errorResponse(new Error("Rule id is required"), 400);
    }

    const updated = await AdminService.updatePricingRule(body.id, body, session.userId);
    if (!updated) {
      return errorResponse(new Error(`Pricing rule not found: ${body.id}`), 404);
    }
    return successResponse(updated, "Pricing rule updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
