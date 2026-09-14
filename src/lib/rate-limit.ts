/**
 * HambakTech Multi-Tier Sliding Window Rate Limiting Engine
 * Provides storage-independent, configurable rate limiting for sensitive API endpoints.
 * 
 * PRODUCTION ARCHITECTURE DIRECTIVE:
 * In a single-instance Node.js deployment (e.g. standard cPanel Passenger runtime),
 * the default InMemoryRateLimitStore is safe and active.
 * For horizontally scaled, multi-instance, or serverless production deployments,
 * replace the store with a shared Redis or database-backed RateLimitStore implementation
 * to prevent per-instance rate-limit evasion.
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
}

export interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Storage-independent Rate Limiting abstraction.
 * Allows swapping between in-memory, Redis, or database persistent stores.
 */
export interface RateLimitStore {
  get(key: string): RateLimitRecord | null;
  set(key: string, record: RateLimitRecord): void;
  delete?(key: string): void;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitRecord>();

  get(key: string): RateLimitRecord | null {
    return this.store.get(key) || null;
  }

  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

// Active storage driver (defaults to memory-safe sliding window)
let activeRateLimitStore: RateLimitStore = new InMemoryRateLimitStore();

export function setRateLimitStore(store: RateLimitStore): void {
  activeRateLimitStore = store;
}

export function getRateLimitStore(): RateLimitStore {
  return activeRateLimitStore;
}

// Predefined rate limiting profiles for different sensitive endpoint tiers
export const RATE_LIMIT_PROFILES: Record<string, RateLimitConfig> = {
  // Authentication: High security, anti-brute-force
  AUTH_LOGIN: { maxRequests: 5, windowSeconds: 15 * 60 }, // 5 attempts per 15 minutes
  AUTH_REGISTER: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 accounts per hour
  AUTH_FORGOT_PASSWORD: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 requests per hour
  AUTH_RESET_PASSWORD: { maxRequests: 5, windowSeconds: 60 * 60 }, // 5 reset attempts per hour
  AUTH_VERIFY_EMAIL: { maxRequests: 5, windowSeconds: 60 * 60 }, // 5 verification attempts per hour
  AUTH_RESEND_VERIFICATION: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 resend attempts per hour
  AUTH_REFRESH: { maxRequests: 30, windowSeconds: 15 * 60 }, // 30 token refreshes per 15 minutes

  // Financial & Payments
  WALLET_FUND: { maxRequests: 10, windowSeconds: 60 }, // 10 funding requests per minute
  PAYMENT_VERIFY: { maxRequests: 30, windowSeconds: 60 }, // 30 verification checks per minute
  WEBHOOK_INCOMING: { maxRequests: 120, windowSeconds: 60 }, // 120 webhooks per minute

  // High-Volume Client Operations (Orders, Enrollments, Shop)
  API_MUTATION: { maxRequests: 30, windowSeconds: 60 }, // 30 create/update actions per minute
  FILE_UPLOAD: { maxRequests: 10, windowSeconds: 5 * 60 }, // 10 uploads per 5 minutes

  // General Public Catalog & Read Queries
  PUBLIC_READ: { maxRequests: 120, windowSeconds: 60 }, // 120 reads per minute
};

/**
 * Checks and records an access attempt against a sliding window rate limit.
 * Automatically purges timestamps outside the sliding window.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStart = now - windowMs;

  let record = activeRateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    activeRateLimitStore.set(key, record);
  }

  // Purge expired timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const currentUsage = record.timestamps.length;
  const resetTime = Math.ceil((now + windowMs) / 1000);

  if (currentUsage >= config.maxRequests) {
    // Oldest timestamp determines exact reset
    const oldest = record.timestamps[0] || now;
    const exactReset = Math.ceil((oldest + windowMs) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: exactReset,
    };
  }

  // Record this attempt
  record.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetTime,
  };
}

/**
 * Extracts a client identifier (IP address, user ID, or credential) for rate limiting.
 */
export function getClientIdentifier(req: Request, fallbackKey?: string): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return fallbackKey || "unknown-client";
}

/**
 * Convenience helper to enforce rate limit on a Request, returning standard HTTP headers.
 */
export function enforceRateLimit(
  req: Request,
  profileName: keyof typeof RATE_LIMIT_PROFILES,
  customIdentifier?: string
): RateLimitResult & { headers: Record<string, string> } {
  const config = RATE_LIMIT_PROFILES[profileName] || RATE_LIMIT_PROFILES.PUBLIC_READ;
  const clientId = customIdentifier || getClientIdentifier(req);
  const key = `${profileName}:${clientId}`;

  const result = checkRateLimit(key, config);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(result.resetTime),
  };

  if (!result.success) {
    const retryAfter = Math.max(1, result.resetTime - Math.ceil(Date.now() / 1000));
    headers["Retry-After"] = String(retryAfter);
  }

  return { ...result, headers };
}
