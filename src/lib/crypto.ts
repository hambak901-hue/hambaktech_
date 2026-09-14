import { randomBytes, pbkdf2Sync, timingSafeEqual, createHash } from "node:crypto";

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

/**
 * Hashes a plaintext password using salted PBKDF2-SHA512.
 * Output format: pbkdf2$iterations$salt$hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];

    const testDerivedKey = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");

    const originalBuf = Buffer.from(originalHash, "hex");
    const testBuf = Buffer.from(testDerivedKey, "hex");

    if (originalBuf.length !== testBuf.length) {
      return false;
    }

    return timingSafeEqual(originalBuf, testBuf);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random, high-entropy token string.
 */
export function generateRandomToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("hex");
}

export const generateToken = generateRandomToken;

/**
 * Generates a SHA-256 hash of a raw token for safe database persistence.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
