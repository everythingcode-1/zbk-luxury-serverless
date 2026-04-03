/**
 * Script untuk mengirim test email ke ompekp@gmail.com
 * 
 * Usage:
 * node scripts/send-test-email.js
 * 
 * Pastikan environment variables sudah di-set:
 * - SMTP_HOST=smtp.gmail.com
 * - SMTP_PORT=587
 * - SMTP_USER=noreplayzbk@gmail.com
 * - SMTP_PASS=your-app-password
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'noreplayzbk@gmail.com',
    pass: process.env.SMTP_PASS,
  },
});

// Test email HTML template
const testEmailHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZBK Limo Tours - Test Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 40px 30px; text-align: center;">
              <!-- Logo ZBK -->
              <img src="${process.env.BASE_URL || 'http://localhost:3000'}/api/logo" alt="ZBK Limo Tours" style="width: 120px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
              
              <h1 style="color: #D4AF37; margin: 10px 0 5px 0; font-size: 24px; font-weight: 600; letter-spacing: 2px;">
                ZBK LIMO TOURS
              </h1>
              <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.9;">
                Premium Transportation Services
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Title -->
              <h2 style="color: #1a1a2e; margin: 0 0 10px 0; font-size: 22px; font-weight: 600; text-align: center;">
                Test Konfigurasi Email
              </h2>
              <p style="color: #666666; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; text-align: center;">
                Email ini dikirim untuk memverifikasi bahwa konfigurasi SMTP Anda berfungsi dengan baik.
              </p>
              
              <!-- Status Badge -->
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin-bottom: 30px; text-align: center;">
                <span style="color: #155724; font-size: 16px; font-weight: 600;">✓ SMTP Berhasil Dikonfigurasi</span>
              </div>
              
              <!-- Test Details -->
              <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">
                  Detail Pengiriman:
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #666666; font-size: 14px; width: 30%;">
                      <strong>From:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px;">
                      noreplayzbk@gmail.com
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                      <strong>To:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                      ompekp@gmail.com
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                      <strong>Waktu:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #1a1a2e; font-size: 14px; border-top: 1px solid #dee2e6;">
                      ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Singapore', dateStyle: 'long', timeStyle: 'short' })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666666; font-size: 14px; border-top: 1px solid #dee2e6;">
                      <strong>Status:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #28a745; font-size: 14px; font-weight: 600; border-top: 1px solid #dee2e6;">
                      Berhasil Terkirim
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Info Message -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; text-align: center;">
                <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                  Jika Anda menerima email ini, berarti konfigurasi SMTP Anda sudah bekerja dengan baik dan siap digunakan untuk mengirim notifikasi booking dan komunikasi lainnya.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                ZBK Limo Tours & Transportation Services
              </p>
              <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">
                📧 zbklimo@gmail.com
              </p>
              <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 13px;">
                📍 Jurong West Street 65, Singapore 640635
              </p>
              <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                Email otomatis dari sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function sendTestEmail() {
  try {
    console.log('📧 Preparing to send test email...');
    console.log('From: noreplayzbk@gmail.com');
    console.log('To: ompekp@gmail.com');
    
    if (!process.env.SMTP_PASS) {
      console.error('❌ Error: SMTP_PASS is not set in environment variables');
      console.log('\nPlease set the following in your .env.local file:');
      console.log('SMTP_HOST=smtp.gmail.com');
      console.log('SMTP_PORT=587');
      console.log('SMTP_USER=noreplayzbk@gmail.com');
      console.log('SMTP_PASS=your-app-password');
      console.log('\nNote: For Gmail, you need to use an App Password, not your regular password.');
      console.log('Get it from: https://myaccount.google.com/apppasswords');
      process.exit(1);
    }

    const info = await transporter.sendMail({
      from: '"ZBK Limo Tours" <noreplayzbk@gmail.com>',
      to: 'ompekp@gmail.com',
      subject: '✅ ZBK Limo Tours - Test Konfigurasi SMTP Berhasil!',
      html: testEmailHTML,
      text: `ZBK Limo Tours - Test Email\n\nThis is a test email to verify SMTP configuration.\n\nTimestamp: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}\n\nIf you receive this email, your SMTP configuration is working correctly!`,
    });

    console.log('\n✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check ompekp@gmail.com inbox for the email.');
    console.log('\n✨ Email should arrive within a few seconds.');
    
  } catch (error) {
    console.error('\n❌ Error sending test email:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. SMTP_USER and SMTP_PASS are correct');
      console.log('2. For Gmail, use App Password (not regular password)');
      console.log('3. Enable "Less secure app access" or use App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('1. SMTP_HOST and SMTP_PORT are correct');
      console.log('2. Internet connection is working');
    }
    
    process.exit(1);
  }
}

// Run the script
sendTestEmail();

