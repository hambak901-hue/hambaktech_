import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UnauthorizedError, ForbiddenError } from "./errors";
import { validateSession, AuthenticatedUserPayload } from "./auth-service";
import { AUTH_CONFIG } from "./auth-constants";

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  user?: AuthenticatedUserPayload;
  fullName?: string;
  phone?: string | null;
  status?: string;
  customerTier?: string;
  walletBalance?: string;
}

/**
 * Extracts session token from incoming request (Cookie or Bearer header).
 */
export function extractSessionToken(req?: NextRequest): string | null {
  if (req) {
    const cookie = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;
    if (cookie) return cookie;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
  }

  try {
    const cookieStore = cookies();
    // @ts-expect-error next/headers cookies can be sync or async depending on Next version
    const token = typeof cookieStore.then === "function" ? null : cookieStore.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;
    return token ?? null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authoritative authenticated session on the server.
 */
export async function getServerSession(req?: NextRequest): Promise<AuthSession | null> {
  let token: string | null = null;

  if (req) {
    token = extractSessionToken(req);
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value ?? null;
    } catch {
      token = null;
    }
  }

  if (!token) {
    return null;
  }

  const user = await validateSession(token);
  if (!user) {
    return null;
  }

  const fullName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : user.email.split("@")[0];

  return {
    userId: user.id,
    email: user.email,
    role: user.role.slug,
    permissions: user.permissions,
    user,
    fullName,
    phone: user.phone,
    status: user.status,
    customerTier: user.customerTier,
    walletBalance: user.wallet?.currentBalance ?? "0.00",
  };
}

/**
 * Validates that the session exists and contains a valid user identifier.
 */
export function assertAuthenticated(session: AuthSession | null | undefined): asserts session is AuthSession {
  if (!session || !session.userId) {
    throw new UnauthorizedError("Authentication required to access this resource");
  }
}

/**
 * Checks whether the current session has one of the allowed roles.
 */
export function hasRole(session: AuthSession, allowedRoles: string[]): boolean {
  if (session.role === "super_admin") return true;
  return allowedRoles.includes(session.role);
}

/**
 * Checks whether the current session has the specified permission.
 * User -> Role -> Permissions -> API authorization -> Resource
 */
export function hasPermission(session: AuthSession, requiredPermission: string): boolean {
  if (session.role === "super_admin") return true;
  if (session.permissions.includes("*")) return true;
  return session.permissions.includes(requiredPermission);
}

/**
 * Asserts that the current user has the required permission or throws ForbiddenError (403).
 */
export function assertPermission(session: AuthSession, requiredPermission: string): void {
  assertAuthenticated(session);
  if (!hasPermission(session, requiredPermission)) {
    throw new ForbiddenError(`Access denied: Missing required permission '${requiredPermission}'`);
  }
}

/**
 * Server-side helper to require authentication in API routes.
 */
export async function requireAuth(req?: NextRequest): Promise<AuthSession> {
  const session = await getServerSession(req);
  assertAuthenticated(session);
  return session;
}

/**
 * Server-side helper to require specific permission in API routes.
 */
export async function requirePermission(requiredPermission: string, req?: NextRequest): Promise<AuthSession> {
  const session = await requireAuth(req);
  assertPermission(session, requiredPermission);
  return session;
}

/**
 * Attaches the session cookie to an outgoing response.
 */
export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set({
    name: AUTH_CONFIG.SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Clears the session cookie on logout.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_CONFIG.SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

