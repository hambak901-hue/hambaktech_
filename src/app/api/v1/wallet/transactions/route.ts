import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let transactions = await WalletService.getTransactions(session.userId);

    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }
    if (status) {
      transactions = transactions.filter((t) => t.status === status);
    }

    const total = transactions.length;
    const startIndex = (page - 1) * limit;
    const paginated = transactions.slice(startIndex, startIndex + limit);

    return successResponse(
      {
        transactions: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      "Transactions retrieved successfully.",
      200,
      { page, limit, total }
    );
  } catch (error) {
    return errorResponse(error, "Failed to retrieve transactions");
  }
}
