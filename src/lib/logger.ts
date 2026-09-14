import { prisma, isDatabaseReachable } from "./db";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogPayload {
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

export interface AuditLogEntry {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

class Logger {
  private format(level: LogLevel, payload: LogPayload): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      context: payload.context || "HambakTech",
      message: payload.message,
      ...(payload.data ? { data: payload.data } : {}),
      ...(payload.error ? { error: payload.error.stack || payload.error.message } : {}),
    });
  }

  public debug(message: string, context?: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", { message, context, data }));
    }
  }

  public info(message: string, context?: string, data?: Record<string, unknown>): void {
    console.info(this.format("info", { message, context, data }));
  }

  public warn(message: string, context?: string, data?: Record<string, unknown>): void {
    console.warn(this.format("warn", { message, context, data }));
  }

  public error(message: string, error?: Error, context?: string, data?: Record<string, unknown>): void {
    console.error(this.format("error", { message, context, data, error }));
  }

  /**
   * Persists an immutable system audit trail record in the database.
   */
  public async audit(entry: AuditLogEntry): Promise<void> {
    try {
      const reachable = await isDatabaseReachable();
      if (reachable) {
        await prisma.auditLog.create({
          data: {
            actorId: entry.actorId,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            beforeState: entry.beforeState ? JSON.stringify(entry.beforeState) : null,
            afterState: entry.afterState ? JSON.stringify(entry.afterState) : null,
          },
        });
      }
    } catch (err) {
      this.warn("Failed to write database audit log entry", "AuditLog", {
        action: entry.action,
        error: (err as Error).message,
      });
    }
  }
}

export const logger = new Logger();
export default logger;
