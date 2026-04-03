import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

// Get and validate Stripe secret key
const getStripeSecretKey = (): string => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  if (!key.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key. Must start with "sk_"')
  }
  return key
}

const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2025-11-17.clover',
})

// POST /api/stripe/confirm-payment - Confirm payment from success page (fallback if webhook hasn't fired)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, bookingId } = body

    if (!sessionId && !bookingId) {
      return NextResponse.json(
        { error: 'Session ID or Booking ID is required' },
        { status: 400 }
      )
    }

    let booking
    let session: Stripe.Checkout.Session | null = null

    // Get booking first
    if (bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          vehicle: true
        }
      })

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      // If already paid, return success
      if (booking.paymentStatus === 'PAID') {
        return NextResponse.json({
          success: true,
          message: 'Payment already confirmed',
          booking: {
            id: booking.id,
            paymentStatus: booking.paymentStatus,
            status: booking.status
          }
        })
      }

      // Get session from booking
      if (booking.stripeSessionId) {
        try {
          session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId)
        } catch (error) {
          console.error('Error retrieving session:', error)
        }
      }
    } else if (sessionId) {
      // Get session from Stripe
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid session ID' },
          { status: 404 }
        )
      }

      // Get booking from session metadata
      const bookingIdFromSession = session.metadata?.bookingId
      if (bookingIdFromSession) {
        booking = await prisma.booking.findUnique({
          where: { id: bookingIdFromSession },
          include: {
            vehicle: true
          }
        })
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if payment is actually successful
    if (session) {
      // Only update if session is completed and payment is successful
      if (session.payment_status === 'paid' && session.status === 'complete') {
        // Get payment intent details
        let paymentIntent: Stripe.PaymentIntent | null = null
        if (session.payment_intent) {
          try {
            if (typeof session.payment_intent === 'string') {
              paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
            }
          } catch (error) {
            console.error('Error retrieving payment intent:', error)
          }
        }

        // Update booking payment status
        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            stripePaymentId: paymentIntent?.id || session.payment_intent as string || booking.stripePaymentId || undefined
          },
          include: {
            vehicle: true
          }
        })

        console.log('✅ Payment confirmed via fallback endpoint:', booking.id)

        // Send confirmation emails (same as webhook)
        try {
          const formattedDate = updatedBooking.startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          // Send confirmation email to customer
          const customerTemplate = emailTemplates.bookingConfirmation(
            updatedBooking.customerName,
            updatedBooking.id,
            updatedBooking.vehicle.name,
            formattedDate,
            updatedBooking.pickupLocation,
            updatedBooking.startTime,
            (updatedBooking as any).pickupNote || undefined,
            updatedBooking.dropoffLocation || undefined,
            (updatedBooking as any).dropoffNote || undefined
          )

          await sendEmail({
            to: updatedBooking.customerEmail,
            subject: customerTemplate.subject,
            html: customerTemplate.html
          })

          // Send notification to admin (always zbklimo@gmail.com)
          const adminTemplate = emailTemplates.adminNotification(
            updatedBooking.id,
            updatedBooking.customerName,
            updatedBooking.customerEmail,
            updatedBooking.customerPhone,
            updatedBooking.vehicle.name,
            updatedBooking.vehicle.model || '',
            updatedBooking.service,
            formattedDate,
            updatedBooking.startTime,
            updatedBooking.pickupLocation,
            updatedBooking.dropoffLocation || '',
            updatedBooking.duration,
            updatedBooking.totalAmount,
            updatedBooking.notes || undefined,
            (updatedBooking as any).serviceType || undefined,
            (updatedBooking as any).pickupNote || undefined,
            (updatedBooking as any).dropoffNote || undefined
          )

          const adminEmail = 'zbklimo@gmail.com'
          await sendEmail({
            to: adminEmail,
            subject: adminTemplate.subject,
            html: adminTemplate.html
          })

          console.log('✅ Confirmation emails sent')
          console.log(`   - Customer email sent to: ${updatedBooking.customerEmail}`)
          console.log(`   - Admin notification sent to: ${adminEmail}`)
        } catch (emailError) {
          console.error('❌ Failed to send confirmation emails:', emailError)
          // Don't fail the payment confirmation if email fails
        }

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed successfully',
          booking: {
            id: updatedBooking.id,
            paymentStatus: updatedBooking.paymentStatus,
            status: updatedBooking.status
          }
        })
      } else {
        // Payment not completed yet
        return NextResponse.json({
          success: false,
          message: 'Payment not completed yet',
          paymentStatus: session.payment_status,
          sessionStatus: session.status
        }, { status: 400 })
      }
    } else {
      // No session found, but booking exists
      return NextResponse.json({
        success: false,
        message: 'No payment session found for this booking',
        booking: {
          id: booking.id,
          paymentStatus: booking.paymentStatus,
          status: booking.status
        }
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}

