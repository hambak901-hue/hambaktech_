import { ValidationError } from "./errors";
import { randomUUID } from "node:crypto";

export interface FileValidationOptions {
  maxSizeBytes?: number; // Default 5 MB
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  isSensitive?: boolean;
}

export const DEFAULT_FILE_SECURITY_CONFIG = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 Megabytes
  ALLOWED_IMAGE_MIMES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOC_MIMES: ["application/pdf"],
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "webp", "pdf"],
  DANGEROUS_EXTENSIONS: [
    "php", "phtml", "php3", "php4", "php5", "phps",
    "exe", "sh", "bash", "bat", "cmd", "ps1",
    "js", "ts", "jsx", "tsx", "mjs", "cjs",
    "html", "htm", "shtml", "xhtml", "svg", // SVG blocked to prevent stored script execution
    "py", "pl", "cgi", "jar", "war", "jsp", "asp", "aspx"
  ],
};

/**
 * Inspects initial buffer bytes (Magic Bytes) to verify the real file structure.
 */
export function verifyBufferMagicBytes(buffer: Buffer, expectedMime: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const hex = buffer.subarray(0, 8).toString("hex").toUpperCase();

  // JPEG: FF D8 FF
  if (expectedMime === "image/jpeg") {
    return hex.startsWith("FFD8FF");
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (expectedMime === "image/png") {
    return hex.startsWith("89504E47");
  }

  // PDF: %PDF- (25 50 44 46)
  if (expectedMime === "application/pdf") {
    return hex.startsWith("25504446");
  }

  // WebP: RIFF ... WEBP (52 49 46 46)
  if (expectedMime === "image/webp") {
    return hex.startsWith("52494646") && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return true;
}

/**
 * Validates file upload against size limits, dangerous extensions, and MIME headers.
 */
export function validateUploadFile(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  buffer?: Buffer,
  options?: FileValidationOptions
): {
  isValid: boolean;
  safeFilename: string;
  extension: string;
} {
  const maxSize = options?.maxSizeBytes || DEFAULT_FILE_SECURITY_CONFIG.MAX_SIZE_BYTES;
  const allowedExts = options?.allowedExtensions || DEFAULT_FILE_SECURITY_CONFIG.ALLOWED_EXTENSIONS;
  const allowedMimes = options?.allowedMimeTypes || [
    ...DEFAULT_FILE_SECURITY_CONFIG.ALLOWED_IMAGE_MIMES,
    ...DEFAULT_FILE_SECURITY_CONFIG.ALLOWED_DOC_MIMES,
  ];

  // 1. File size check
  if (sizeBytes <= 0) {
    throw new ValidationError("File is empty or corrupted.");
  }
  if (sizeBytes > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(1);
    throw new ValidationError(`File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${maxMb}MB.`);
  }

  // 2. Filename & extension analysis
  const sanitizedOriginal = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const parts = sanitizedOriginal.split(".");
  if (parts.length < 2) {
    throw new ValidationError("Uploaded file must have a valid file extension.");
  }

  const extension = parts[parts.length - 1].toLowerCase();

  // Check against dangerous extensions (e.g. .php, .exe, .sh, .html)
  if (DEFAULT_FILE_SECURITY_CONFIG.DANGEROUS_EXTENSIONS.includes(extension)) {
    throw new ValidationError(`Uploading executable or script files (.${extension}) is strictly prohibited.`);
  }

  if (!allowedExts.includes(extension)) {
    throw new ValidationError(
      `File format .${extension} is not permitted. Allowed formats: ${allowedExts.join(", ")}.`
    );
  }

  // 3. MIME type checking
  const cleanMime = mimeType.toLowerCase().trim();
  if (!allowedMimes.includes(cleanMime)) {
    throw new ValidationError(`MIME type '${cleanMime}' is not permitted.`);
  }

  // 4. Magic byte inspection if buffer provided
  if (buffer && !verifyBufferMagicBytes(buffer, cleanMime)) {
    throw new ValidationError("File content structure does not match the claimed file extension.");
  }

  // 5. Generate secure, non-guessable storage filename
  // Never preserve client-supplied raw names to prevent directory traversal or file-overwrite attacks
  const safeFilename = `ht_${randomUUID()}.${extension}`;

  return {
    isValid: true,
    safeFilename,
    extension,
  };
}
