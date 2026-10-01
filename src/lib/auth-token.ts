/**
 * HambakTech Client-Side Session & Token Transport
 * 
 * Production web authentication relies on secure server-side session cookies (HttpOnly / Secure)
 * and transient memory contexts. Does NOT depend on persistent tokens in localStorage or sessionStorage.
 * All authoritative authorization decisions occur on the PHP/MySQL server side.
 */

let inMemoryAuthToken: string | null = null;

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return inMemoryAuthToken;
  try {
    // 1. Check transient in-memory token first
    if (inMemoryAuthToken) {
      return inMemoryAuthToken;
    }

    // 2. Read session cookie (if accessible to client scripts)
    const match = document.cookie.match(/(?:^|;\s*)(?:ht_session|hambak_token|session_token)=([^;]*)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      inMemoryAuthToken = decoded;
      return decoded;
    }

    return null;
  } catch {
    return inMemoryAuthToken;
  }
}

export function setStoredAuthToken(token: string): void {
  inMemoryAuthToken = token;
  if (typeof window === "undefined") return;
  try {
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    // Set standard session cookie (browser session lifetime or standard 7-day max-age with SameSite strictness)
    document.cookie = `ht_session=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    document.cookie = `hambak_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
  } catch {
    // Ignore sandbox cookie errors
  }
}

export function clearStoredAuthToken(): void {
  inMemoryAuthToken = null;
  if (typeof window === "undefined") return;
  try {
    // Clean up any legacy localStorage/sessionStorage items if present
    try {
      sessionStorage.removeItem("ht_session");
      sessionStorage.removeItem("hambak_token");
      localStorage.removeItem("ht_session");
      localStorage.removeItem("hambak_token");
    } catch {
      // Storage access might be restricted
    }

    document.cookie = "ht_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "hambak_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  } catch {
    // Ignore errors
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}
