import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "./lib/auth-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;

  // Protect /dashboard and /admin routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isDashboardRoute || isAdminRoute) {
    if (!sessionToken) {
      const redirectUrl = new URL("/signin", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
