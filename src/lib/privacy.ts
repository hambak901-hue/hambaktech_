/**
 * HambakTech Sensitive Data Protection & NDPR Compliance Engine
 * Enforces data minimization, zero leakage of private credentials,
 * and standard masking for identity documents (NIN, BVN, Phone, Email).
 */

/**
 * Masks a National Identity Number (NIN) to display only the terminal digits.
 * Input: "12345678901" -> Output: "*******8901"
 */
export function maskNIN(nin: string | null | undefined): string {
  if (!nin) return "";
  const clean = nin.replace(/\D/g, "");
  if (clean.length < 4) return "****";
  const lastFour = clean.slice(-4);
  return `${"*".repeat(clean.length - 4)}${lastFour}`;
}

/**
 * Masks a Bank Verification Number (BVN).
 * Input: "22334455667" -> Output: "*******5667"
 */
export function maskBVN(bvn: string | null | undefined): string {
  if (!bvn) return "";
  const clean = bvn.replace(/\D/g, "");
  if (clean.length < 4) return "****";
  return `${"*".repeat(clean.length - 4)}${clean.slice(-4)}`;
}

/**
 * Masks a Nigerian phone number, preserving prefix and last 4 digits.
 * Input: "08147837664" -> Output: "081****7664"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const clean = phone.trim();
  if (clean.length < 8) return "****";
  const start = clean.slice(0, 3);
  const end = clean.slice(-4);
  return `${start}****${end}`;
}

/**
 * Masks an email address for public or semi-public display.
 * Input: "customer@hambaktech.com.ng" -> Output: "c******r@hambaktech.com.ng"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}${"*".repeat(Math.max(1, local.length - 2))}${last}@${domain}`;
}

/**
 * Masks a payment reference or account number.
 */
export function maskAccountNumber(acc: string | null | undefined): string {
  if (!acc) return "";
  const clean = acc.trim();
  if (clean.length < 4) return "****";
  return `******${clean.slice(-4)}`;
}

/**
 * Recursively sanitizes any payload or object to strip private credentials
 * (passwords, tokens, secret keys, raw NINs) before transmission or audit logging.
 */
export function sanitizeSensitiveRecord<T>(data: T): T {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeSensitiveRecord(item)) as unknown as T;
  }

  const result: Record<string, any> = { ...data };
  const sensitiveKeyPatterns = [
    /password/i,
    /tokenHash/i,
    /secret/i,
    /apiKey/i,
    /privateKey/i,
    /cvv/i,
    /pin/i,
    /authKey/i,
  ];

  for (const key of Object.keys(result)) {
    // 1. Completely delete dangerous secret fields
    if (sensitiveKeyPatterns.some((pattern) => pattern.test(key))) {
      delete result[key];
      continue;
    }

    // 2. Automatically mask NIN fields
    if (/nin/i.test(key) && typeof result[key] === "string") {
      result[key] = maskNIN(result[key]);
    }

    // 3. Automatically mask BVN fields
    if (/bvn/i.test(key) && typeof result[key] === "string") {
      result[key] = maskBVN(result[key]);
    }

    // 4. Recursively sanitize nested objects
    if (result[key] && typeof result[key] === "object") {
      result[key] = sanitizeSensitiveRecord(result[key]);
    }
  }

  return result as T;
}

/**
 * Official HambakTech Privacy Policy Declaration
 * Documents Nigerian Data Protection Regulation (NDPR) alignment.
 */
export const NDPR_COMPLIANCE_STATEMENT = {
  dataController: "HambakTech Smart Digital Solutions (Ibeju-Lekki, Lagos)",
  principles: [
    "Lawfulness, Fairness and Transparency: Personal data is collected solely for service fulfillment with explicit consent.",
    "Purpose Limitation: Data is collected for explicit business and training needs and not further processed incompatibly.",
    "Data Minimization: Only data strictly necessary for processing (e.g., student enrolment, NIN registration assistance) is requested.",
    "Storage Limitation: Documents submitted for processing are retained only for the legally mandated retention period.",
    "Integrity and Confidentiality: All identity records are encrypted, masked, and access-controlled with strict role-based permissions.",
  ],
  regulatoryDisclaimer:
    "HambakTech acts as an authorized registration desk and identity support services agent. Direct access claims to government national databases without authorized integration partner protocols are strictly prohibited.",
};
