/**
 * Customer Registration API
 * POST /api/auth/customer/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  generateEmailVerificationToken,
  sanitizeCustomerData,
  getEmailVerificationUrl,
} from '@/lib/customer-auth';
import { validateEmail, validatePassword } from '@/types/customer';
import { getWelcomeEmailTemplate } from '@/lib/customer-email-templates';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      facebookHandle,
      instagramHandle,
      twitterHandle,
      linkedinHandle,
    } = body;

    // Validation
    if (!title || !firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'All required fields must be provided',
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

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check password confirmation
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Passwords do not match',
        },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        title,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        facebookHandle: facebookHandle || null,
        instagramHandle: instagramHandle || null,
        twitterHandle: twitterHandle || null,
        linkedinHandle: linkedinHandle || null,
        emailVerificationToken,
        isEmailVerified: false,
        isActive: true,
      },
    });

    // Send welcome email with verification link
    try {
      const verificationUrl = getEmailVerificationUrl(emailVerificationToken);
      const emailTemplate = getWelcomeEmailTemplate(
        {
          title: customer.title,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        },
        verificationUrl
      );

      await sendEmail({
        to: customer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      console.log('✅ Welcome email sent to:', customer.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Return sanitized customer data
    const sanitizedCustomer = sanitizeCustomerData(customer);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        customer: sanitizedCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}

















