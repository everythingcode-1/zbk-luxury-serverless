import nodemailer from 'nodemailer'

// Helper function to format time to 12-hour format with AM/PM
function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text, from }: EmailOptions & { from?: string }) {
  try {
    // Default to zbklimo@gmail.com if not specified
    const fromEmail = from || process.env.SMTP_USER || 'zbklimo@gmail.com'
    const fromName = 'ZBK Limousine Tours'
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Email templates
export const emailTemplates = {
  // Email untuk Customer - Setelah pembayaran berhasil (Payment Confirmation)
  bookingConfirmation: (
    customerName: string, 
    bookingId: string, 
    vehicleName: string, 
    date: string,
    pickupLocation?: string,
    pickupTime?: string,
    pickupNote?: string,
    dropoffLocation?: string,
    dropoffNote?: string
  ) => {
    const formattedTime = pickupTime ? formatTime12Hour(pickupTime) : '';
    
    return {
    subject: `Payment Confirmed - Booking ${bookingId} | ZBK Limousine Tours`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #1a1a2e; padding: 40px 30px; text-align: center;">
                    <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com'}/api/logo" alt="ZBK Limousine Tours" style="width: 100px; height: auto; margin-bottom: 15px;" />
                    
                    <h1 style="color: #D4AF37; margin: 10px 0 5px 0; font-size: 24px; font-weight: 600; letter-spacing: 2px;">
                      ZBK LIMOUSINE TOURS
                    </h1>
                    <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.9;">
                      Premium Transportation Services
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <!-- Success Badge -->
                    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin-bottom: 30px; text-align: center;">
                      <span style="color: #155724; font-size: 16px; font-weight: 600;">✓ Payment Confirmed Successfully</span>
                    </div>
                    
                    <h2 style="color: #1a1a2e; margin: 0 0 10px 0; font-size: 22px; font-weight: 600;">
                      Dear ${customerName},
                    </h2>
                    <p style="color: #666666; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6;">
                      Thank you for your payment. Your booking has been confirmed and we're excited to serve you!
                    </p>
                    
                    <!-- Booking Details -->
                    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 25px; margin-bottom: 30px;">
                      <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">
                        Your Booking Details:
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; width: 35%;">
                            <strong>Booking ID:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">
                            ${bookingId}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                            <strong>Vehicle:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                            ${vehicleName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                            <strong>Date:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                            ${date}
                          </td>
                        </tr>
                        ${pickupTime ? `
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                            <strong>Pickup Time:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                            ${formattedTime}
                          </td>
                        </tr>
                        ` : ''}
                        ${pickupLocation ? `
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6; vertical-align: top;">
                            <strong>Pickup Location:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                            ${pickupLocation}
                            ${pickupNote ? `<br/><span style="color: #D4AF37; font-size: 13px; font-style: italic;">📍 ${pickupNote}</span>` : ''}
                          </td>
                        </tr>
                        ` : ''}
                        ${dropoffLocation ? `
                        <tr>
                          <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6; vertical-align: top;">
                            <strong>Drop-off Location:</strong>
                          </td>
                          <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                            ${dropoffLocation}
                            ${dropoffNote ? `<br/><span style="color: #D4AF37; font-size: 13px; font-style: italic;">📍 ${dropoffNote}</span>` : ''}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    <!-- What to Expect -->
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
                      <h3 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                        What to Expect:
                      </h3>
                      <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                        <li>Our driver will arrive 10 minutes before your scheduled pickup time</li>
                        <li>You will receive the driver's contact details 24 hours before your trip</li>
                        <li>Please have your Booking ID ready for verification</li>
                      </ul>
                    </div>
                    
                    <!-- Contact Info -->
                    <div style="text-align: center; padding: 20px; border-top: 1px solid #dee2e6;">
                      <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">
                        Need to make changes or have questions?
                      </p>
                      <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">
                        Contact us at: <a href="mailto:zbklimo@gmail.com" style="color: #D4AF37; text-decoration: none;">zbklimo@gmail.com</a>
                      </p>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                      ZBK Limousine Tours & Transportation Services
                    </p>
                    <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">
                      📧 zbklimo@gmail.com
                    </p>
                    <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 13px;">
                      📍 Jurong West Street 65, Singapore 640635
                    </p>
                    <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                      Thank you for choosing ZBK Limousine Tours!
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    }
  },

  bookingStatusUpdate: (customerName: string, bookingId: string, status: string) => ({
    subject: `Booking Update - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D4AF37, #F7DC6F); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ZBK Luxury Transport</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Booking Status Update</h2>
          <p>Dear ${customerName},</p>
          <p>Your booking status has been updated:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>New Status:</strong> <span style="color: #D4AF37; font-weight: bold;">${status}</span></p>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center;">
          <p>ZBK Luxury Transport | Jakarta, Indonesia</p>
        </div>
      </div>
    `
  }),

  // Email untuk Admin (zbklimo@gmail.com) - Simple & Elegant
  adminNotification: (
    bookingId: string, 
    customerName: string, 
    customerEmail: string,
    customerPhone: string,
    vehicleName: string,
    vehicleModel: string,
    service: string,
    startDate: string,
    startTime: string,
    pickupLocation: string,
    dropoffLocation: string,
    duration: string,
    totalAmount: number,
    notes?: string,
    serviceType?: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL',
    pickupNote?: string,
    dropoffNote?: string
  ) => {
    const formattedTime = formatTime12Hour(startTime);
    
    // Determine service label
    let serviceLabel = 'Round Trip';
    if (serviceType === 'AIRPORT_TRANSFER') {
      serviceLabel = 'Airport Transfer (One Way)';
    } else if (serviceType === 'TRIP') {
      serviceLabel = 'Trip (One Way)';
    } else if (serviceType === 'RENTAL') {
      serviceLabel = 'Rental per Hours';
    } else {
      // Fallback: detect from service string
      const isOneWay = service.toUpperCase().includes('ONE') || 
                       service.toUpperCase().includes('AIRPORT') || 
                       service.toUpperCase().includes('TRANSFER');
      serviceLabel = isOneWay ? 'One Way' : 'Round Trip';
    }
    
    return {
    subject: `New Booking ${bookingId} - ${customerName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                    <h1 style="color: #D4AF37; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px;">
                      NEW BOOKING CONFIRMED
                    </h1>
                    <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                      Payment Received • ${bookingId}
                    </p>
                  </td>
                </tr>
                
                <!-- Customer Info -->
                <tr>
                  <td style="padding: 30px;">
                    <div style="background-color: #f8f9fa; border-left: 3px solid #D4AF37; padding: 20px; margin-bottom: 25px;">
                      <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">
                        Customer Information
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px; width: 25%;">Name:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 500;">${customerName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Email:</td>
                          <td style="padding: 6px 0;"><a href="mailto:${customerEmail}" style="color: #D4AF37; text-decoration: none; font-size: 14px;">${customerEmail}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Phone:</td>
                          <td style="padding: 6px 0;"><a href="tel:${customerPhone}" style="color: #1a1a2e; text-decoration: none; font-size: 14px; font-weight: 500;">${customerPhone}</a></td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Booking Details -->
                    <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                      <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">
                        Booking Details
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px; width: 25%;">Vehicle:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 500;">${vehicleName}${vehicleModel ? ` ${vehicleModel}` : ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Service Type:</td>
                          <td style="padding: 6px 0; color: #D4AF37; font-size: 14px; font-weight: 600;">${serviceLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Date:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 500;">${startDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Time:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 500;">${formattedTime}</td>
                        </tr>
                        ${serviceType === 'RENTAL' ? `
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px;">Duration:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 500;">${duration}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px; padding-top: 12px; border-top: 1px solid #e0e0e0;">Amount:</td>
                          <td style="padding: 6px 0; color: #28a745; font-size: 16px; font-weight: 700; padding-top: 12px; border-top: 1px solid #e0e0e0;">SGD ${totalAmount.toFixed(2)}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Location Details -->
                    <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                      <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">
                        Location
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px; width: 25%; vertical-align: top;">Pickup:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; line-height: 1.5;">
                            ${pickupLocation}
                            ${pickupNote ? `<br/><span style="color: #D4AF37; font-size: 13px; font-weight: 600; background: #fffbf0; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-top: 4px;">📍 ${pickupNote}</span>` : ''}
                          </td>
                        </tr>
                        ${dropoffLocation ? `
                        <tr>
                          <td style="padding: 6px 0; color: #666; font-size: 14px; vertical-align: top;">Drop-off:</td>
                          <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; line-height: 1.5;">
                            ${dropoffLocation}
                            ${dropoffNote ? `<br/><span style="color: #D4AF37; font-size: 13px; font-weight: 600; background: #fffbf0; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-top: 4px;">📍 ${dropoffNote}</span>` : ''}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    ${notes ? `
                    <div style="background-color: #fffbf0; border-left: 3px solid #ffc107; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                      <h4 style="color: #856404; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Notes:</h4>
                      <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">${notes}</p>
                    </div>
                    ` : ''}
                    
                    <!-- Action Button -->
                    <div style="text-align: center; padding: 20px 0;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com'}/admin/bookings" 
                         style="background-color: #D4AF37; color: #1a1a2e; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
                        View in Dashboard
                      </a>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #6c757d; margin: 0; font-size: 13px;">
                      ZBK Limousine Tours • zbklimo@gmail.com
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    }
  }
}
