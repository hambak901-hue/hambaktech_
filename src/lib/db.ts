import { PrismaClient } from "@prisma/client";
import net from "net";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var dbReachableCache: { status: boolean; checkedAt: number } | undefined;
}

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: unknown) => (d as { data?: unknown })?.data ?? {},
  update: async (d: unknown) => (d as { data?: unknown })?.data ?? {},
  delete: async () => ({}),
  count: async () => 0,
  upsert: async (d: unknown) => (d as { create?: unknown })?.create ?? {},
  $queryRaw: async () => [],
  $transaction: async (fnOrArray: unknown) => {
    if (typeof fnOrArray === "function") {
      return (fnOrArray as (tx: unknown) => unknown)(mockPrismaClient);
    }
    if (Array.isArray(fnOrArray)) {
      return Promise.all(fnOrArray);
    }
    return [];
  },
};

export const mockPrismaClient = new Proxy({} as PrismaClient, {
  get: () =>
    new Proxy(noOp, {
      get: (target, prop) => {
        if (prop in target) {
          return (target as Record<string, unknown>)[prop as string];
        }
        return async () => null;
      },
    }),
});

/**
 * Fast, non-blocking check to determine if the configured database host/port is accepting connections.
 * Caches status for 30 seconds to prevent unnecessary network overhead.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;

  const now = Date.now();
  if (global.dbReachableCache && now - global.dbReachableCache.checkedAt < 30000) {
    return global.dbReachableCache.status;
  }

  try {
    const parsed = new URL(dbUrl.replace(/^mysql:\/\//, "http://").replace(/^postgresql:\/\//, "http://"));
    const host = parsed.hostname || "127.0.0.1";
    const port = parsed.port ? parseInt(parsed.port, 10) : 3306;

    const isReachable = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(400);

      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });

      socket.once("timeout", () => {
        socket.destroy();
        resolve(false);
      });

      socket.once("error", () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });

    global.dbReachableCache = { status: isReachable, checkedAt: now };
    return isReachable;
  } catch {
    global.dbReachableCache = { status: false, checkedAt: now };
    return false;
  }
}

/**
 * Creates a configured PrismaClient with event-based error emission to prevent unhandled stderr dumps.
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  // Intercept Prisma engine events silently to prevent unsolicited console stderr dumps
  (client as any).$on("error", () => {
    // Gracefully captured
  });
  (client as any).$on("warn", () => {
    // Gracefully captured
  });

  return client;
}

/**
 * Returns a singleton instance of PrismaClient.
 * Employs lazy initialization and global persistence across development cycles with safe mock fallback.
 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    return mockPrismaClient;
  }

  try {
    if (process.env.NODE_ENV === "production") {
      if (!global.prismaGlobal) {
        global.prismaGlobal = createPrismaClient();
      }
      return global.prismaGlobal;
    }

    if (!global.prismaGlobal) {
      global.prismaGlobal = createPrismaClient();
    }

    return global.prismaGlobal;
  } catch {
    return mockPrismaClient;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    try {
      const client = getPrisma();
      const value = (client as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return value.bind(client);
      }
      if (value !== undefined) {
        return value;
      }
      return (mockPrismaClient as unknown as Record<string | symbol, unknown>)[prop];
    } catch {
      return (mockPrismaClient as unknown as Record<string | symbol, unknown>)[prop];
    }
  },
});

export default prisma;
