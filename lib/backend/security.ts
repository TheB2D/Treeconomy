// ==========================================
// TREECONOMY SECURITY UTILITIES
// Encryption, data sanitization, and security helpers
// ==========================================

import crypto from "crypto";
import { config } from "./config";
import type { EncryptedData } from "./types";

// ------------------------------------------
// ENCRYPTION UTILITIES (AES-256-GCM)
// ------------------------------------------

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 16 bytes for GCM
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Encrypts sensitive data using AES-256-GCM
 * CRITICAL: Use this for SSNs, credit data, and PII
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = Buffer.from(config.security.encryptionKey, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypts data encrypted with the encrypt function
 */
export function decrypt(encryptedData: EncryptedData): string {
  const key = Buffer.from(config.security.encryptionKey, "hex");
  const iv = Buffer.from(encryptedData.iv, "hex");
  const tag = Buffer.from(encryptedData.tag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// ------------------------------------------
// SSN SANITIZATION
// ------------------------------------------

/**
 * Masks SSN for display (shows only last 4 digits)
 */
export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, "");
  if (digits.length !== 9) {
    return "***-**-****";
  }
  return `***-**-${digits.slice(-4)}`;
}

/**
 * Validates SSN format (9 digits, no dashes)
 */
export function validateSSN(ssn: string): boolean {
  const digits = ssn.replace(/\D/g, "");
  return digits.length === 9 && /^\d{9}$/.test(digits);
}

/**
 * Normalizes SSN to 9 digits (removes dashes)
 */
export function normalizeSSN(ssn: string): string {
  return ssn.replace(/\D/g, "");
}

/**
 * Checks if SSN is a valid sandbox test SSN (starts with 666)
 */
export function isSandboxSSN(ssn: string): boolean {
  const normalized = normalizeSSN(ssn);
  return normalized.startsWith("666");
}

// ------------------------------------------
// DATA SANITIZATION
// ------------------------------------------

/**
 * Removes all PII from an object for safe logging
 */
export function sanitizeForLogging(obj: any): any {
  const sensitiveFields = [
    "ssn",
    "socialSecurityNumber",
    "password",
    "token",
    "apiKey",
    "accountNumber",
  ];

  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Extracts only safe fields from credit report for storage
 * NEVER store raw credit reports - only transformed metrics
 */
export function extractSafeMetrics(creditReport: any): {
  score: number;
  utilization: number;
  inquiries: number;
  onTimePayments: number;
  openAccounts: number;
} {
  return {
    score: creditReport.creditScore?.score || 0,
    utilization: creditReport.utilization || 0,
    inquiries: creditReport.inquiries?.length || 0,
    onTimePayments: creditReport.onTimePaymentPercent || 0,
    openAccounts: creditReport.openAccounts || 0,
  };
}

// ------------------------------------------
// HASHING & TOKENS
// ------------------------------------------

/**
 * Creates a secure hash of data (SHA-256)
 */
export function hash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generates a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Creates a deterministic user ID from email/identifier
 */
export function createUserId(identifier: string): string {
  return hash(identifier).slice(0, 16);
}

// ------------------------------------------
// RATE LIMITING HELPERS
// ------------------------------------------

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiting
 * Production: Use Redis or database
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    const resetAt = now + windowMs;
    requestCounts.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (userLimit.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: userLimit.resetAt,
    };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetAt: userLimit.resetAt,
  };
}

// ------------------------------------------
// ENVIRONMENT VALIDATION
// ------------------------------------------

/**
 * Ensures we're in sandbox when using test SSNs
 */
export function validateEnvironment(ssn: string): {
  valid: boolean;
  error?: string;
} {
  const isTest = isSandboxSSN(ssn);
  const isProduction = config.crs.environment === "production";

  if (isTest && isProduction) {
    return {
      valid: false,
      error: "Cannot use sandbox SSN in production environment",
    };
  }

  if (!isTest && !isProduction) {
    return {
      valid: false,
      error:
        "Must use sandbox SSN (starts with 666) in sandbox environment",
    };
  }

  return { valid: true };
}

// ------------------------------------------
// TEMPORARY DATA CLEANUP
// ------------------------------------------

const temporaryData = new Map<
  string,
  { data: any; expiresAt: number; type: string }
>();

/**
 * Stores data temporarily with automatic expiration
 * Use for credit reports that should be deleted after transformation
 */
export function storeTemporary(
  key: string,
  data: any,
  ttlMinutes: number = 15,
  type: string = "credit_data"
): void {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  temporaryData.set(key, { data, expiresAt, type });
}

/**
 * Retrieves temporary data if not expired
 */
export function retrieveTemporary(key: string): any | null {
  const item = temporaryData.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    temporaryData.delete(key);
    return null;
  }

  return item.data;
}

/**
 * Manually deletes temporary data
 */
export function deleteTemporary(key: string): void {
  temporaryData.delete(key);
}

/**
 * Cleanup expired temporary data (run periodically)
 */
export function cleanupExpiredData(): void {
  const now = Date.now();
  for (const [key, item] of temporaryData.entries()) {
    if (now > item.expiresAt) {
      temporaryData.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredData, 5 * 60 * 1000);
}
