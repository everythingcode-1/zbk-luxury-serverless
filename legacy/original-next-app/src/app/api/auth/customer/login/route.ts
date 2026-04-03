/**
 * Customer Login API
 * POST /api/auth/customer/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  comparePassword,
  generateCustomerToken,
  sanitizeCustomerData,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from '@/lib/customer-auth';
import { validateEmail } from '@/types/customer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimit = checkLoginRateLimit(email.toLowerCase());
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${rateLimit.resetIn} seconds.`,
          resetIn: rateLimit.resetIn,
        },
        { status: 429 }
      );
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!customer.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetLoginRateLimit(email.toLowerCase());

    // Update last login timestamp
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email,
      type: 'customer',
    });

    // Return sanitized customer data with token
    const sanitizedCustomer = sanitizeCustomerData(customer);

    // Warning if email not verified
    const emailWarning = !customer.isEmailVerified
      ? 'Please verify your email address to access all features.'
      : null;

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        customer: sanitizedCustomer,
        token,
        warning: emailWarning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}

















