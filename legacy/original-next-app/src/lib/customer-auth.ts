/**
 * Customer Authentication Utilities
 * Helper functions for customer authentication, JWT, password management
 */

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Ensure secrets are always strings
const JWT_SECRET: string = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as StringValue;
const SALT_ROUNDS = 10;

// JWT Token Interfaces
export interface CustomerJWTPayload {
  customerId: string;
  email: string;
  type: 'customer';
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate JWT token for customer
 */
export function generateCustomerToken(payload: CustomerJWTPayload): string {
  const secret: Secret = JWT_SECRET;
  const options: SignOptions = { 
    expiresIn: JWT_EXPIRES_IN as StringValue
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Verify and decode JWT token
 */
export function verifyCustomerToken(token: string): CustomerJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
    
    // Verify it's a customer token
    if (decoded.type !== 'customer') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a secure random token for password reset or email verification
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate password reset token with expiry
 */
export function generatePasswordResetToken(): {
  token: string;
  expires: Date;
} {
  const token = generateSecureToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token valid for 1 hour

  return { token, expires };
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): string {
  return generateSecureToken();
}

/**
 * Check if reset token is expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize customer data for API response (remove sensitive fields)
 */
export function sanitizeCustomerData(customer: any) {
  const {
    password,
    resetPasswordToken,
    resetPasswordExpires,
    emailVerificationToken,
    ...sanitized
  } = customer;
  
  // Add full name
  const fullName = `${customer.firstName} ${customer.lastName}`;
  
  return {
    ...sanitized,
    fullName,
  };
}

/**
 * Generate customer profile URL
 */
export function getCustomerProfileUrl(customerId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/customer/profile`;
}

/**
 * Generate password reset URL
 */
export function getPasswordResetUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/customer/reset-password?token=${token}`;
}

/**
 * Generate email verification URL
 */
export function getEmailVerificationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/customer/verify-email?token=${token}`;
}

/**
 * Rate limiting helper - Simple in-memory store
 * For production, use Redis or similar
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetIn?: number;
} {
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  
  const record = loginAttempts.get(email);
  
  if (!record || now > record.resetAt) {
    // No record or window expired
    loginAttempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    const resetIn = Math.ceil((record.resetAt - now) / 1000); // seconds
    return { allowed: false, remainingAttempts: 0, resetIn };
  }
  
  record.count++;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count };
}

export function resetLoginRateLimit(email: string): void {
  loginAttempts.delete(email);
}

/**
 * Clean up expired rate limit records periodically
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  for (const [email, record] of loginAttempts.entries()) {
    if (now > record.resetAt) {
      loginAttempts.delete(email);
    }
  }
}

// Note: Module-level setInterval removed to prevent multiple intervals
// in serverless environments. Cleanup should be called manually or
// via a scheduled job/cron instead of module-level interval.
// For production, consider using:
// - Vercel Cron Jobs
// - AWS EventBridge
// - Or call cleanupRateLimitRecords() manually in API routes when needed

