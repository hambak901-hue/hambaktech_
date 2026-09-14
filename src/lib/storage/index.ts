/**
 * HambakTech Storage Provider Abstraction
 * Manages secure file uploads, traversal protection, directory initialization,
 * and distinct storage realms (public assets vs protected sensitive documents).
 */

import fs from "fs";
import path from "path";

export interface UploadResult {
  url: string;
  key: string;
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  isSensitive: boolean;
}

export interface StorageProvider {
  upload(
    fileBuffer: Buffer,
    safeFilename: string,
    mimeType: string,
    isSensitive?: boolean
  ): Promise<UploadResult>;
  delete(key: string, isSensitive?: boolean): Promise<boolean>;
  getUrl(key: string, isSensitive?: boolean): string;
  exists(key: string, isSensitive?: boolean): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  private publicUploadDir: string;
  private privateUploadDir: string;

  constructor() {
    // Public uploads served statically by Next.js from public/uploads
    this.publicUploadDir = path.resolve(process.cwd(), "public", "uploads");
    // Sensitive uploads stored securely outside public root to prevent unauthenticated access
    this.privateUploadDir = path.resolve(process.cwd(), "storage", "secure_vault");

    this.ensureDirectory(this.publicUploadDir);
    this.ensureDirectory(this.privateUploadDir);
  }

  private ensureDirectory(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (err) {
      console.error(`[StorageProvider] Failed to ensure directory: ${dirPath}`, err);
    }
  }

  private sanitizeFilename(filename: string): string {
    // Strip dangerous path traversal characters and non-alphanumeric except safe delimiters
    const base = path.basename(filename);
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  private resolveSafePath(filename: string, isSensitive: boolean): { fullPath: string; safeKey: string } {
    const safeKey = this.sanitizeFilename(filename);
    const targetDir = isSensitive ? this.privateUploadDir : this.publicUploadDir;
    const fullPath = path.resolve(targetDir, safeKey);

    // Guard against path traversal attacks
    if (!fullPath.startsWith(targetDir)) {
      throw new Error("Path traversal security violation detected in upload key.");
    }

    return { fullPath, safeKey };
  }

  public async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    isSensitive = false
  ): Promise<UploadResult> {
    const { fullPath, safeKey } = this.resolveSafePath(filename, isSensitive);
    const targetDir = path.dirname(fullPath);

    this.ensureDirectory(targetDir);

    await fs.promises.writeFile(fullPath, fileBuffer);

    const url = isSensitive
      ? `/api/v1/storage/secure-document?key=${encodeURIComponent(safeKey)}`
      : `/uploads/${safeKey}`;

    return {
      url,
      key: safeKey,
      storagePath: fullPath,
      sizeBytes: fileBuffer.length,
      mimeType,
      isSensitive,
    };
  }

  public async delete(key: string, isSensitive = false): Promise<boolean> {
    try {
      const { fullPath } = this.resolveSafePath(key, isSensitive);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[StorageProvider] Failed to delete file with key: ${key}`, err);
      return false;
    }
  }

  public getUrl(key: string, isSensitive = false): string {
    const safeKey = this.sanitizeFilename(key);
    return isSensitive
      ? `/api/v1/storage/secure-document?key=${encodeURIComponent(safeKey)}`
      : `/uploads/${safeKey}`;
  }

  public async exists(key: string, isSensitive = false): Promise<boolean> {
    const { fullPath } = this.resolveSafePath(key, isSensitive);
    return fs.existsSync(fullPath);
  }
}

// Storage Provider Factory supporting environment configuration
export function getStorageProvider(): StorageProvider {
  const providerType = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  switch (providerType) {
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

export const storageProvider = getStorageProvider();
export default storageProvider;
