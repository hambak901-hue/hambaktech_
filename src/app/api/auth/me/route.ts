import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      throw new UnauthorizedError("Not authenticated");
    }

    return successResponse(
      {
        session: {
          userId: session.userId,
          email: session.email,
          fullName: session.fullName,
          phone: session.phone,
          role: session.role,
          permissions: session.permissions,
          status: session.status,
          customerTier: session.customerTier,
          walletBalance: session.walletBalance,
        },
        user: session.user,
      },
      "Current user session retrieved."
    );
  } catch (error) {
    return errorResponse(error, "Failed to retrieve user session");
  }
}
