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
 * M12 Profile & Password Hardening Schemas
 */
export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z
    .string()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number format")
    .optional(),
  state: z.string().max(50).optional(),
  lga: z.string().max(50).optional(),
  address: z.string().max(255).optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * M12 Financial, Orders, Services & Identity Schemas
 */
export const FundWalletSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .min(100, "Minimum wallet funding amount is ₦100")
    .max(5000000, "Maximum single transaction limit is ₦5,000,000"),
  gateway: z.enum(["PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"]).default("PAYSTACK"),
  reference: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  serviceCategorySlug: z.string().min(2).max(50),
  serviceCategoryName: z.string().min(2).max(100),
  serviceTitle: z.string().min(2).max(150),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(150),
        quantity: z.coerce.number().int().positive().max(1000),
        unitPrice: z.coerce.number().nonnegative(),
        serviceId: z.string().optional(),
      })
    )
    .min(1, "Order must contain at least one item"),
  paymentMethod: z.enum(["WALLET", "PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"]).default("WALLET"),
  deliveryType: z.enum(["INSTANT_DIGITAL", "PHYSICAL_PICKUP", "COURIER_DELIVERY", "ONLINE_PORTAL"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const EnrollCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  cohort: z.string().optional(),
  payWithWallet: z.boolean().default(true),
});

export const CreateShopOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive().max(100),
      })
    )
    .min(1, "Shop cart cannot be empty"),
  deliveryZoneId: z.string().min(1, "Delivery zone selection is required"),
  deliveryAddress: z.string().min(5, "Valid delivery address is required").max(300),
  paymentMethod: z.enum(["WALLET", "PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"]).default("WALLET"),
  notes: z.string().max(500).optional(),
});

export const NINRequestSchema = z.object({
  applicantName: z.string().min(3).max(100),
  phone: z.string().regex(/^(\+?234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number format"),
  email: z.string().email().toLowerCase().trim(),
  serviceType: z.enum([
    "SLIP_RETRIEVAL",
    "DATA_MODIFICATION",
    "PLASTIC_ID_CARD",
    "BVN_HARMONIZATION",
    "PRE_ENROLLMENT_ASSISTANCE",
  ]),
  ninNumber: z
    .string()
    .regex(/^\d{11}$/, "National Identity Number must be exactly 11 numeric digits")
    .optional(),
  deliveryType: z.enum(["DIGITAL_DOWNLOAD", "PHYSICAL_PICKUP"]).default("PHYSICAL_PICKUP"),
  pickupOffice: z.string().default("HambakTech Ibeju-Lekki Center"),
  notes: z.string().max(500).optional(),
});

export const CACRequestSchema = z.object({
  proposedName1: z.string().min(3).max(150),
  proposedName2: z.string().min(3).max(150),
  entityType: z.enum(["BUSINESS_NAME", "PRIVATE_LIMITED_COMPANY", "INCORPORATED_TRUSTEE_NGO"]),
  natureOfBusiness: z.string().min(5).max(300),
  applicantName: z.string().min(3).max(100),
  applicantPhone: z.string().regex(/^(\+?234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number format"),
  applicantEmail: z.string().email().toLowerCase().trim(),
  directorsCount: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().max(500).optional(),
});

export const SupportTicketSchema = z.object({
  category: z.enum([
    "WALLET",
    "WALLET_FUNDING",
    "VTU_BILLS",
    "ORDERS",
    "NIN_DESK",
    "CAC_DESK",
    "CAC_REGISTRATION",
    "ACADEMY",
    "PRINTING_CENTRE",
    "TECHNICAL",
  ]),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(3000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const FileUploadValidationSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  sizeBytes: z.coerce.number().int().positive().max(5 * 1024 * 1024),
});

/**
 * XSS Mitigation: Strips dangerous HTML and scripts from untrusted user strings
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "")
    .trim();
}

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
