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
 * M4 Authentication Schemas
 */
export const RegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    phone: z
      .string()
      .regex(/^(\+?234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number format (e.g. 08147837664 or +2348147837664)")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    customerTier: z.enum(["STANDARD", "AGENT", "CORPORATE"]).default("STANDARD"),
    roleSlug: z.enum(["customer", "student", "agent"]).default("customer"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms and Conditions to proceed",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  credential: z.string().min(3, "Email or phone number is required").trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(16, "Reset token is invalid or missing"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(16, "Verification token is invalid or missing"),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const CheckPermissionSchema = z.object({
  permission: z.string().min(1, "Permission slug is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;


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
