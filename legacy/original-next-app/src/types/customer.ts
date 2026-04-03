/**
 * Customer Types
 * Type definitions for customer authentication and profile
 */

import { Title } from '@prisma/client';

// Re-export Title enum from Prisma for convenience
export { Title };

export interface Customer {
  id: string;
  title: Title;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  
  // Social Media
  facebookHandle?: string | null;
  instagramHandle?: string | null;
  twitterHandle?: string | null;
  linkedinHandle?: string | null;
  
  // Account Status
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerWithBookings extends Customer {
  bookings: any[]; // You can type this with your Booking type
}

// For API responses (without sensitive data)
export interface CustomerProfile {
  id: string;
  title: Title;
  firstName: string;
  lastName: string;
  fullName: string; // firstName + lastName
  email: string;
  phoneNumber: string;
  facebookHandle?: string | null;
  instagramHandle?: string | null;
  twitterHandle?: string | null;
  linkedinHandle?: string | null;
  isEmailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

// Registration form data
export interface CustomerRegistrationData {
  title: Title;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
  facebookHandle?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
}

// Login form data
export interface CustomerLoginData {
  email: string;
  password: string;
}

// Password reset request
export interface ForgotPasswordData {
  email: string;
}

// Reset password with token
export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

// Change password (when logged in)
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

// Update profile
export interface UpdateCustomerProfileData {
  title?: Title;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  facebookHandle?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
}

// Email verification
export interface EmailVerificationData {
  token: string;
}

// Auth response
export interface CustomerAuthResponse {
  success: boolean;
  message?: string;
  customer?: CustomerProfile;
  token?: string;
}

// Title display helpers
export const TITLE_LABELS: Record<Title, string> = {
  [Title.MR]: 'Mr.',
  [Title.MS]: 'Ms.',
  [Title.MRS]: 'Mrs.',
  [Title.DR]: 'Dr.',
  [Title.PROF]: 'Prof.',
};

// Helper function to get full name with title
export function getFullNameWithTitle(customer: Customer | CustomerProfile): string {
  const title = TITLE_LABELS[customer.title];
  return `${title} ${customer.firstName} ${customer.lastName}`;
}

// Helper function to get full name without title
export function getFullName(customer: Customer | CustomerProfile): string {
  return `${customer.firstName} ${customer.lastName}`;
}

// Validation helpers
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - adjust based on your requirements
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

















