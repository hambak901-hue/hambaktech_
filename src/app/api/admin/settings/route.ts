import { NextRequest, NextResponse } from "next/server";
import { companyConfig } from "@/data/companyConfig";
import { validateSession } from "@/lib/auth-service";
import { AUTH_CONFIG } from "@/lib/auth-constants";

// Global cache for mutable runtime settings in dev/preview
const globalForSettings = globalThis as unknown as {
  __hambakRuntimeSettings?: {
    systemStatus: {
      maintenanceMode: boolean;
      userRegistration: boolean;
      vtuAutoDispatch: boolean;
    };
    companyConfig: typeof companyConfig;
  };
};

if (!globalForSettings.__hambakRuntimeSettings) {
  globalForSettings.__hambakRuntimeSettings = {
    systemStatus: {
      maintenanceMode: false,
      userRegistration: true,
      vtuAutoDispatch: true,
    },
    companyConfig: { ...companyConfig },
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }
  if (!token) {
    token = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value || req.cookies.get("hambak_token")?.value;
  }

  return NextResponse.json({
    success: true,
    data: globalForSettings.__hambakRuntimeSettings,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
    if (!token) {
      token = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value || req.cookies.get("hambak_token")?.value;
    }

    if (token) {
      const user = await validateSession(token);
      if (user && !["super_admin", "admin"].includes(user.role.slug)) {
        return NextResponse.json(
          { success: false, error: { message: "Administrative privileges required." } },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    if (body.systemStatus) {
      globalForSettings.__hambakRuntimeSettings!.systemStatus = {
        ...globalForSettings.__hambakRuntimeSettings!.systemStatus,
        ...body.systemStatus,
      };
    }
    if (body.companyConfig) {
      globalForSettings.__hambakRuntimeSettings!.companyConfig = {
        ...globalForSettings.__hambakRuntimeSettings!.companyConfig,
        ...body.companyConfig,
      };
    }

    return NextResponse.json({
      success: true,
      message: "System and company settings updated successfully.",
      data: globalForSettings.__hambakRuntimeSettings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
