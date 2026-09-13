import { prisma } from "./db";

interface CachedSetting {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CachedSetting>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Configuration Service
 * Enforces the rule that nothing operational or commercial is hardcoded.
 */
export class ConfigService {
  /**
   * Retrieves a Company Setting by key.
   */
  public static async getCompanySetting(key: string, fallback = ""): Promise<string> {
    const cached = cache.get(`comp:${key}`);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      if (process.env.DATABASE_URL) {
        const setting = await prisma.companySetting.findUnique({
          where: { key },
        });
        if (setting) {
          cache.set(`comp:${key}`, { value: setting.value, expiresAt: Date.now() + CACHE_TTL_MS });
          return setting.value;
        }
      }
    } catch {
      // Fall through to fallback
    }

    return fallback;
  }

  /**
   * Retrieves a System Operational Setting by key.
   */
  public static async getSystemSetting(key: string, fallback = ""): Promise<string> {
    const cached = cache.get(`sys:${key}`);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      if (process.env.DATABASE_URL) {
        const setting = await prisma.systemSetting.findUnique({
          where: { key },
        });
        if (setting) {
          cache.set(`sys:${key}`, { value: setting.value, expiresAt: Date.now() + CACHE_TTL_MS });
          return setting.value;
        }
      }
    } catch {
      // Fall through to fallback
    }

    return fallback;
  }

  /**
   * Retrieves numeric setting with fallback.
   */
  public static async getNumber(key: string, fallback = 0): Promise<number> {
    const val = await this.getSystemSetting(key, String(fallback));
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Retrieves boolean setting with fallback.
   */
  public static async getBoolean(key: string, fallback = false): Promise<boolean> {
    const val = await this.getSystemSetting(key, String(fallback));
    return val.toLowerCase() === "true" || val === "1";
  }

  /**
   * Clears the in-memory settings cache.
   */
  public static clearCache(): void {
    cache.clear();
  }
}

export default ConfigService;
