/**
 * HambakTech API Client Configuration
 * Single authoritative source for client-side API endpoint resolution.
 * Production Canonical Namespace: /api/*
 * Absolute Safety Rule: Never target protected primary domain https://hambaktech.com.ng
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") || "";

// Safety check: Never route API requests to protected primary domain https://hambaktech.com.ng
const safeBaseUrl = (() => {
  if (!rawBaseUrl) return "";
  try {
    const parsed = new URL(rawBaseUrl);
    // If someone accidentally configured the primary domain without "business.", block it
    if (
      (parsed.hostname === "hambaktech.com.ng" || parsed.hostname === "www.hambaktech.com.ng") &&
      !parsed.hostname.startsWith("business.")
    ) {
      // In browser or SSR, fallback to same-origin relative path /api/*
      return "";
    }
  } catch {
    // Malformed URL, ignore and use relative
    return "";
  }
  return rawBaseUrl;
})();

export const API_BASE_URL = safeBaseUrl;

/**
 * Resolves an API path against the configured API_BASE_URL.
 * Standardizes to canonical unversioned `/api/...` while supporting absolute URLs.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If the endpoint is already an absolute URL (e.g. https://...), check safety
  if (/^https?:\/\//i.test(cleanEndpoint)) {
    try {
      const parsed = new URL(cleanEndpoint);
      if (
        (parsed.hostname === "hambaktech.com.ng" || parsed.hostname === "www.hambaktech.com.ng") &&
        !parsed.hostname.startsWith("business.")
      ) {
        // Reroute accidental primary domain call to safe canonical path
        return parsed.pathname + parsed.search;
      }
    } catch {
      // fallback
    }
    return cleanEndpoint;
  }

  // Canonical normalization: convert legacy /api/v1/* to /api/*
  let normalized = cleanEndpoint;
  if (normalized.startsWith("/api/v1/")) {
    normalized = `/api/${normalized.substring("/api/v1/".length)}`;
  } else if (!normalized.startsWith("/api/")) {
    normalized = `/api${normalized}`;
  }

  // In the browser, if we are on business.hambaktech.com.ng or localhost, prefer same-origin relative path
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("hambaktech.com.ng") || host === "localhost" || host === "127.0.0.1") {
      return normalized;
    }
  }

  if (API_BASE_URL) {
    return `${API_BASE_URL}${normalized}`;
  }

  return normalized;
}

