import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

// POST /api/bookings/[id]/email - Send email notification for booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, customMessage } = body // type: 'confirmation' | 'status_update' | 'custom'
    
    // Get booking with vehicle details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            name: true,
            model: true,
            plateNumber: true
          }
        }
      }
    })
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    
    let emailTemplate
    
    switch (type) {
      case 'confirmation':
        emailTemplate = emailTemplates.bookingConfirmation(
          booking.customerName,
          booking.id,
          booking.vehicle.name,
          booking.startDate.toLocaleDateString()
        )
        break
        
      case 'status_update':
        emailTemplate = emailTemplates.bookingStatusUpdate(
          booking.customerName,
          booking.id,
          booking.status
        )
        break
        
      case 'custom':
        emailTemplate = {
          subject: `Update for your booking - ${booking.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #D4AF37, #F7DC6F); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">ZBK Luxury Transport</h1>
              </div>
              <div style="padding: 20px; background: #f9f9f9;">
                <h2 style="color: #333;">Booking Update</h2>
                <p>Dear ${booking.customerName},</p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>Booking ID:</strong> ${booking.id}</p>
                  <p><strong>Message:</strong></p>
                  <p>${customMessage}</p>
                </div>
                <p>If you have any questions, please don't hesitate to contact us.</p>
              </div>
              <div style="background: #333; color: white; padding: 15px; text-align: center;">
                <p>ZBK Luxury Transport | Jakarta, Indonesia</p>
              </div>
            </div>
          `
        }
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid email type'
        }, { status: 400 })
    }
    
    // Send email
    const result = await sendEmail({
      to: booking.customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        data: {
          bookingId: booking.id,
          customerEmail: booking.customerEmail,
          emailType: type,
          messageId: result.messageId
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error sending booking email:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send email'
    }, { status: 500 })
  }
}
