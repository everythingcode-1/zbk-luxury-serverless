/**
 * Customer Email Templates
 * Email templates for customer authentication system
 */

import { Title } from '@/types/customer';
import { TITLE_LABELS } from '@/types/customer';

const APP_NAME = 'ZBK Limousine Tours';
const SUPPORT_EMAIL = 'support@zbklimo.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface CustomerEmailData {
  title: Title;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Get customer greeting with title
 */
function getCustomerGreeting(customer: CustomerEmailData): string {
  const titleLabel = TITLE_LABELS[customer.title];
  return `${titleLabel} ${customer.lastName}`;
}

/**
 * Welcome Email - Sent after successful registration
 */
export function getWelcomeEmailTemplate(
  customer: CustomerEmailData,
  verificationUrl: string
): { subject: string; html: string; text: string } {
  const greeting = getCustomerGreeting(customer);

  const subject = `Welcome to ${APP_NAME}!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #d4af37; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${APP_NAME}!</h1>
    </div>
    <div class="content">
      <p>Dear ${greeting},</p>
      
      <p>Thank you for registering with ${APP_NAME}! We're excited to have you as part of our luxury transportation family.</p>
      
      <p>To complete your registration and start booking premium vehicles, please verify your email address:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; word-break: break-all;">
        ${verificationUrl}
      </p>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>✅ Verify your email address</li>
        <li>🚗 Browse our luxury vehicle fleet</li>
        <li>📅 Make your first booking</li>
        <li>👤 Complete your profile</li>
      </ul>
      
      <p>If you didn't create this account, please ignore this email or contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}">Visit our website</a> | <a href="mailto:${SUPPORT_EMAIL}">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to ${APP_NAME}!

Dear ${greeting},

Thank you for registering with ${APP_NAME}! We're excited to have you as part of our luxury transportation family.

To complete your registration and start booking premium vehicles, please verify your email address by clicking the link below:

${verificationUrl}

What's Next?
- Verify your email address
- Browse our luxury vehicle fleet
- Make your first booking
- Complete your profile

If you didn't create this account, please ignore this email or contact us at ${SUPPORT_EMAIL}.

Best regards,
The ${APP_NAME} Team

© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
  `;

  return { subject, html, text };
}

/**
 * Email Verification - Resend verification email
 */
export function getEmailVerificationTemplate(
  customer: CustomerEmailData,
  verificationUrl: string
): { subject: string; html: string; text: string } {
  const greeting = getCustomerGreeting(customer);

  const subject = `Verify Your Email - ${APP_NAME}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #d4af37; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Dear ${greeting},</p>
      
      <p>Please verify your email address to activate your ${APP_NAME} account and start booking luxury vehicles.</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; word-break: break-all;">
        ${verificationUrl}
      </p>
      
      <p>If you didn't request this verification, please ignore this email.</p>
      
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verify Your Email - ${APP_NAME}

Dear ${greeting},

Please verify your email address to activate your ${APP_NAME} account and start booking luxury vehicles.

Click the link below to verify:
${verificationUrl}

If you didn't request this verification, please ignore this email.

Best regards,
The ${APP_NAME} Team
  `;

  return { subject, html, text };
}

/**
 * Password Reset Email
 */
export function getPasswordResetEmailTemplate(
  customer: CustomerEmailData,
  resetUrl: string
): { subject: string; html: string; text: string } {
  const greeting = getCustomerGreeting(customer);

  const subject = `Reset Your Password - ${APP_NAME}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #d4af37; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Dear ${greeting},</p>
      
      <p>We received a request to reset your password for your ${APP_NAME} account.</p>
      
      <p>Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; word-break: break-all;">
        ${resetUrl}
      </p>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <ul style="margin: 10px 0;">
          <li>This link will expire in <strong>1 hour</strong></li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your password won't change until you create a new one</li>
        </ul>
      </div>
      
      <p>If you didn't request a password reset, please contact our support team immediately at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="mailto:${SUPPORT_EMAIL}">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Password Reset Request - ${APP_NAME}

Dear ${greeting},

We received a request to reset your password for your ${APP_NAME} account.

Click the link below to create a new password:
${resetUrl}

SECURITY NOTICE:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password won't change until you create a new one

If you didn't request a password reset, please contact our support team immediately at ${SUPPORT_EMAIL}.

Best regards,
The ${APP_NAME} Team
  `;

  return { subject, html, text };
}

/**
 * Password Changed Confirmation Email
 */
export function getPasswordChangedEmailTemplate(
  customer: CustomerEmailData
): { subject: string; html: string; text: string } {
  const greeting = getCustomerGreeting(customer);

  const subject = `Password Changed Successfully - ${APP_NAME}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .success { background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Password Changed</h1>
    </div>
    <div class="content">
      <p>Dear ${greeting},</p>
      
      <div class="success">
        <strong>✅ Success!</strong><br>
        Your password has been changed successfully.
      </div>
      
      <p>Your ${APP_NAME} account password was recently changed. If you made this change, no further action is needed.</p>
      
      <p><strong>If you didn't change your password:</strong></p>
      <ul>
        <li>Your account may have been compromised</li>
        <li>Please contact us immediately at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
        <li>We'll help you secure your account</li>
      </ul>
      
      <p>For your security, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Not sharing your password with anyone</li>
        <li>Changing your password regularly</li>
      </ul>
      
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Password Changed Successfully - ${APP_NAME}

Dear ${greeting},

✅ Success! Your password has been changed successfully.

Your ${APP_NAME} account password was recently changed. If you made this change, no further action is needed.

If you didn't change your password:
- Your account may have been compromised
- Please contact us immediately at ${SUPPORT_EMAIL}
- We'll help you secure your account

For your security, we recommend:
- Using a strong, unique password
- Not sharing your password with anyone
- Changing your password regularly

Best regards,
The ${APP_NAME} Team
  `;

  return { subject, html, text };
}


















