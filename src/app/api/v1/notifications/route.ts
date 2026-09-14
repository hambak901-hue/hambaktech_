import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { NotificationService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const notifications = await NotificationService.getNotifications(session.userId);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return successResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return errorResponse(error, "Failed to retrieve notifications");
  }
}
