import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { NotificationService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const markedCount = await NotificationService.markAllRead(session.userId);

    return successResponse(
      { markedCount },
      `${markedCount} notification(s) marked as read.`
    );
  } catch (error) {
    return errorResponse(error, "Failed to mark all notifications as read");
  }
}
