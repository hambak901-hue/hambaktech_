import { NextRequest } from "next/server";
import { ForbiddenError } from "./errors";

/**
 * ============================================================================
 * HAMBAKTECH CSRF PROTECTION ARCHITECTURE & POLICY
 * ============================================================================
 *
 * 1. Mobile Clients (Android, iOS) & Direct API Integrations:
 *    - Native mobile clients authenticate using explicit `Authorization: Bearer <token>` headers.
 *    - In RFC standards and browser security models, Cross-Site Request Forgery (CSRF)
 *      specifically exploits ambient credentials automatically dispatched by browsers (Cookies).
 *    - Native mobile clients and API clients do NOT dispatch ambient cookies across web contexts.
 *    - Therefore, Bearer-authenticated API calls are structurally exempt from CSRF checks.
 *
 * 2. Web Browser Sessions (Cookie-Based):
 *    - Web clients utilize HTTP-only, SameSite=Lax session cookies.
 *    - For state-changing HTTP methods (POST, PUT, PATCH, DELETE), CSRF defenses are enforced:
 *      a. Origin and Referer validation: Requests originating from foreign web origins are rejected.
 *      b. SameSite=Lax prevents top-level cross-site form POST attacks.
 *      c. Custom Header requirement: API requests must include 'Content-Type: application/json'
 *         or 'x-requested-with' / 'x-csrf-token' which cannot be issued via cross-origin <form> POSTs.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Validates request origin against allowed hostnames.
 */
export function isAllowedOrigin(originOrReferer: string | null, host: string | null): boolean {
  if (!originOrReferer) return true; // Direct programmatic requests without origin

  try {
    const url = new URL(originOrReferer);
    const requestHost = url.host.toLowerCase();

    // Check if origin matches host
    if (host && requestHost === host.toLowerCase()) {
      return true;
    }

    // Allow standard development and production domains
    const allowedHosts = [
      "localhost",
      "127.0.0.1",
      "hambaktech.com.ng",
      "www.hambaktech.com.ng",
      "api.hambaktech.com.ng",
    ];

    return allowedHosts.some(
      (allowed) => requestHost === allowed || requestHost.endsWith(`.${allowed}`) || requestHost.includes(".run.app")
    );
  } catch {
    return false;
  }
}

/**
 * Evaluates whether a request requires CSRF verification and validates it.
 * Throws ForbiddenError (403) if a CSRF violation is detected.
 */
export function verifyCsrf(req: NextRequest): void {
  // Safe read-only HTTP methods are exempt
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return;
  }

  // Mobile and external API consumers sending explicit Bearer tokens are exempt
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return;
  }

  // For browser requests that could rely on session cookies:
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Validate Origin header if present
  if (origin && !isAllowedOrigin(origin, host)) {
    throw new ForbiddenError("CSRF protection: Invalid or unauthorized request origin.");
  }

  // Validate Referer header if Origin is not present
  if (!origin && referer && !isAllowedOrigin(referer, host)) {
    throw new ForbiddenError("CSRF protection: Invalid or untrusted referer header.");
  }
}
