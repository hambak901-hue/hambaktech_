import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { NotificationService } from "@/lib/server/platform-store";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    const success = await NotificationService.markRead(id, session.userId);
    if (!success) {
      throw new NotFoundError(`Notification '${id}' not found or already read.`);
    }

    return successResponse({ success: true }, "Notification marked as read.");
  } catch (error) {
    return errorResponse(error, "Failed to mark notification as read");
  }
}
