import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { validateData, CheckPermissionSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * Server-Side Permission Authorization Verification Endpoint
 * Validates: User -> Role -> Permissions -> API authorization -> Resource
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { permission } = validateData(CheckPermissionSchema, body);

    // Enforce strict server-side permission check (throws 401 if unauthenticated, 403 if unauthorized)
    const session = await requirePermission(permission, req);

    return successResponse(
      {
        authorized: true,
        user: {
          id: session.userId,
          email: session.email,
          role: session.role,
        },
        permissionChecked: permission,
        userPermissions: session.permissions,
      },
      `Authorized: Session granted access for permission '${permission}'.`
    );
  } catch (error) {
    return errorResponse(error, "Authorization verification failed");
  }
}
