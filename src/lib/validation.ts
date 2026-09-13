import { z } from "zod";
import { ValidationError } from "./errors";

/**
 * Universal Pagination & Filtering Query Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Company Setting Upsert Schema
 */
export const CompanySettingSchema = z.object({
  key: z.string().min(2).max(100),
  value: z.string(),
  group: z.enum(["GENERAL", "COMPANY", "PAYMENT", "NOTIFICATION", "SECURITY", "SERVICES"]).default("GENERAL"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

/**
 * System Setting Upsert Schema
 */
export const SystemSettingSchema = z.object({
  key: z.string().min(2).max(100),
  value: z.string(),
  type: z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"]).default("STRING"),
  isEncrypted: z.boolean().default(false),
  description: z.string().optional(),
});

/**
 * Pricing Calculation Input Schema
 */
export const PriceCalculationSchema = z.object({
  basePrice: z.coerce.number().nonnegative(),
  markupPercent: z.coerce.number().min(0).max(100).default(0),
  flatFee: z.coerce.number().min(0).default(0),
  minFee: z.coerce.number().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
});

/**
 * Synchronous Schema Validator with AppError Throw
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formatted = result.error.format();
    throw new ValidationError("Input validation failed", formatted);
  }
  return result.data;
}
