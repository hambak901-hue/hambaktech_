import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
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
};

const mockPrismaClient = new Proxy({} as PrismaClient, {
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
 * Returns a singleton instance of PrismaClient.
 * Employs lazy initialization and global persistence across development cycles with safe mock fallback.
 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    return mockPrismaClient;
  }
  try {
    if (process.env.NODE_ENV === "production") {
      return new PrismaClient();
    }

    if (!global.prismaGlobal) {
      global.prismaGlobal = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    }

    return global.prismaGlobal;
  } catch (err) {
    console.warn("[AI Studio] Database not connected — using mock", err);
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
