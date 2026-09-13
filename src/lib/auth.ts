import { UnauthorizedError, ForbiddenError } from "./errors";

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
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
 */
export function hasPermission(session: AuthSession, requiredPermission: string): boolean {
  if (session.role === "super_admin") return true;
  return session.permissions.includes(requiredPermission) || session.permissions.includes("*");
}

/**
 * Asserts that the current user has the required permission or throws ForbiddenError.
 */
export function assertPermission(session: AuthSession, requiredPermission: string): void {
  assertAuthenticated(session);
  if (!hasPermission(session, requiredPermission)) {
    throw new ForbiddenError(`Missing required permission: ${requiredPermission}`);
  }
}
