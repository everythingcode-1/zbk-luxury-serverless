import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// Test email endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, type = 'test', sendToZbk = false } = body

    // If sendToZbk is true, send to zbklimo@gmail.com
    const recipientEmail = sendToZbk ? 'zbklimo@gmail.com' : (to || 'zbklimo@gmail.com')

    if (!recipientEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 })
    }

    let emailResult;

    switch (type) {
      case 'booking':
        // Test booking confirmation email
        const customerTemplate = emailTemplates.bookingConfirmation(
          'Test Customer',
          'TEST-001',
          'Toyota Alphard',
          new Date().toLocaleDateString()
        )
        
        emailResult = await sendEmail({
          to: recipientEmail,
          subject: customerTemplate.subject,
          html: customerTemplate.html
        })
        break;

      case 'admin':
        // Test admin notification email
        const adminTemplate = emailTemplates.adminNotification(
          'TEST-001',
          'Test Customer',
          'test@example.com',
          '+65 1234 5678',
          'Toyota Alphard',
          'Alphard 2024',
          'RENTAL',
          new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          '09:00',
          'Jurong West Street 65, Singapore 640635',
          'Marina Bay Sands, Singapore',
          '8 hours',
          800.00,
          'This is a test booking notification'
        )
        
        emailResult = await sendEmail({
          to: recipientEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html
        })
        break;

      default:
        // Test basic email with professional design
        emailResult = await sendEmail({
          to: recipientEmail,
          subject: 'ZBK Limousine Tours - Test Email Configuration',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>ZBK Limousine Tours - Test Email</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
                <tr>
                  <td style="padding: 20px 0; text-align: center;">
                    <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="color: #D4AF37; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
                            ZBK LIMOUSINE TOURS
                          </h1>
                          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                            & Transportation Services
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D4AF37, #F7DC6F); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                              <span style="font-size: 40px;">✓</span>
                            </div>
                            <h2 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">
                              Email Configuration Test
                            </h2>
                            <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                              This is a test email to verify that your SMTP configuration is working correctly.
                            </p>
                          </div>
                          
                          <div style="background-color: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0; border-radius: 5px;">
                            <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                              Test Details
                            </h3>
                            <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 40%;"><strong>From Email:</strong></td>
                                <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">zbklimo@gmail.com</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>To Email:</strong></td>
                                <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${recipientEmail}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Timestamp:</strong></td>
                                <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore', dateStyle: 'full', timeStyle: 'long' })}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Status:</strong></td>
                                <td style="padding: 8px 0; color: #28a745; font-size: 14px; font-weight: 600;">✓ Successfully Sent</td>
                              </tr>
                            </table>
                          </div>
                          
                          <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                            <p style="color: #1a1a2e; margin: 0; font-size: 16px; line-height: 1.8;">
                              <strong style="color: #D4AF37;">Congratulations!</strong><br>
                              If you are reading this email, it means your email configuration is working perfectly. 
                              You can now send booking confirmations, notifications, and other important communications to your customers.
                            </p>
                          </div>
                          
                          <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #e9ecef;">
                            <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                              About ZBK Limousine Tours
                            </h3>
                            <p style="color: #666666; margin: 0 0 15px 0; font-size: 14px; line-height: 1.8;">
                              ZBK Limousine Tours & Transportation Services is a premium luxury transportation company 
                              based in Singapore, providing exceptional limousine and vehicle rental services for 
                              weddings, corporate events, airport transfers, and special occasions.
                            </p>
                            <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin-top: 20px;">
                              <p style="margin: 0; color: #1a1a2e; font-size: 14px; line-height: 1.8;">
                                <strong style="color: #D4AF37;">📍 Address:</strong><br>
                                Jurong West Street 65<br>
                                ZBK Limousine Tours & Transportation Services<br>
                                Singapore 640635
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                          <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">
                            <strong>ZBK Limousine Tours & Transportation Services</strong>
                          </p>
                          <p style="color: #D4AF37; margin: 0 0 15px 0; font-size: 14px;">
                            Premium Luxury Transportation in Singapore
                          </p>
                          <div style="margin: 20px 0;">
                            <p style="color: #999999; margin: 5px 0; font-size: 12px;">
                              📧 Email: zbklimo@gmail.com
                            </p>
                            <p style="color: #999999; margin: 5px 0; font-size: 12px;">
                              📍 Jurong West Street 65, Singapore 640635
                            </p>
                          </div>
                          <p style="color: #666666; margin: 20px 0 0 0; font-size: 11px; border-top: 1px solid #333; padding-top: 15px;">
                            This is an automated test email. Please do not reply to this message.
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
        })
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: emailResult.messageId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: emailResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email'
    }, { status: 500 })
  }
}

// GET endpoint to show test form
export async function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZBK Email Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #D4AF37; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #C9A227; }
        .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      </style>
    </head>
    <body>
      <h1>🚗 ZBK Luxury Transport - Email Test</h1>
      <p>Test your SMTP configuration by sending test emails.</p>
      
      <form id="emailForm">
        <div class="form-group">
          <label for="email">Email Address:</label>
          <input type="email" id="email" name="email" required placeholder="test@example.com">
        </div>
        
        <div class="form-group">
          <label for="type">Email Type:</label>
          <select id="type" name="type">
            <option value="test">Basic Test Email</option>
            <option value="booking">Booking Confirmation</option>
            <option value="admin">Admin Notification</option>
          </select>
        </div>
        
        <button type="submit">Send Test Email</button>
      </form>
      
      <div id="result"></div>
      
      <script>
        document.getElementById('emailForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const type = document.getElementById('type').value;
          const resultDiv = document.getElementById('result');
          
          resultDiv.innerHTML = '<p>Sending email...</p>';
          
          try {
            const response = await fetch('/api/test-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: email, type })
            });
            
            const result = await response.json();
            
            if (result.success) {
              resultDiv.innerHTML = \`<div class="result success">
                <strong>✅ Success!</strong><br>
                Email sent to: \${email}<br>
                Message ID: \${result.messageId || 'N/A'}
              </div>\`;
            } else {
              resultDiv.innerHTML = \`<div class="result error">
                <strong>❌ Error!</strong><br>
                \${result.error}
              </div>\`;
            }
          } catch (error) {
            resultDiv.innerHTML = \`<div class="result error">
              <strong>❌ Network Error!</strong><br>
              \${error.message}
            </div>\`;
          }
        });
      </script>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
