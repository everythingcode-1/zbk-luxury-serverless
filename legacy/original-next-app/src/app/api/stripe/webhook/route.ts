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

// Disable body parsing, need raw body for webhook signature verification
export const runtime = 'nodejs'

// Allow CORS for Stripe webhook
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  })
}

// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🟢 [STRIPE WEBHOOK] ==========================================')
  console.log('🟢 [STRIPE WEBHOOK] Webhook received at:', new Date().toISOString())
  console.log('🟢 [STRIPE WEBHOOK] Request method:', request.method)
  console.log('🟢 [STRIPE WEBHOOK] Request URL:', request.url)
  console.log('🟢 [STRIPE WEBHOOK] Request headers:', {
    'content-type': request.headers.get('content-type'),
    'user-agent': request.headers.get('user-agent'),
    'stripe-signature': request.headers.get('stripe-signature') ? 'present' : 'missing'
  })
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('🟢 [STRIPE WEBHOOK] Webhook signature present:', !!signature)
  console.log('🟢 [STRIPE WEBHOOK] Body length:', body.length)
  console.log('🟢 [STRIPE WEBHOOK] Body preview (first 200 chars):', body.substring(0, 200))

  if (!signature) {
    console.error('❌ [STRIPE WEBHOOK] No signature provided')
    return NextResponse.json(
      { error: 'No signature provided' },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      }
    )
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
    console.log('🟢 [STRIPE WEBHOOK] Webhook secret configured:', !!webhookSecret)
    
    // Verify webhook signature (in production, use your webhook secret)
    // For development, we'll skip verification if no secret is set
    if (webhookSecret) {
      console.log('🟢 [STRIPE WEBHOOK] Verifying webhook signature...')
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ [STRIPE WEBHOOK] Signature verified successfully')
    } else {
      console.warn('⚠️ [STRIPE WEBHOOK] No webhook secret - parsing without verification (DEV MODE)')
      // For development/testing, parse the event without verification
      event = JSON.parse(body) as Stripe.Event
    }
    
    console.log('🟢 [STRIPE WEBHOOK] Event type:', event.type)
    console.log('🟢 [STRIPE WEBHOOK] Event ID:', event.id)
  } catch (err: any) {
    console.error('❌ [STRIPE WEBHOOK] ==========================================')
    console.error('❌ [STRIPE WEBHOOK] Webhook signature verification failed')
    console.error('❌ [STRIPE WEBHOOK] Error:', err.message)
    console.error('❌ [STRIPE WEBHOOK] Error stack:', err.stack)
    console.error('❌ [STRIPE WEBHOOK] ==========================================')
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      }
    )
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      console.log('🟢 [STRIPE WEBHOOK] Processing checkout.session.completed event')
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      console.log('🟢 [STRIPE WEBHOOK] Session details:', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        bookingId: bookingId
      })

      if (!bookingId) {
        console.error('❌ [STRIPE WEBHOOK] No booking ID in session metadata')
        console.error('❌ [STRIPE WEBHOOK] Session metadata:', session.metadata)
        return NextResponse.json({ error: 'No booking ID found' }, { status: 400 })
      }

      console.log('🟢 [STRIPE WEBHOOK] Updating booking payment status...')
      console.log('🟢 [STRIPE WEBHOOK] Booking ID to update:', bookingId)
      
      // First, check if booking exists
      const existingBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          paymentStatus: true,
          status: true,
          stripePaymentId: true
        }
      })
      
      if (!existingBooking) {
        console.error('❌ [STRIPE WEBHOOK] Booking not found in database:', bookingId)
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      
      console.log('🟢 [STRIPE WEBHOOK] Existing booking status:', {
        paymentStatus: existingBooking.paymentStatus,
        status: existingBooking.status
      })
      
      // Update booking payment status
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          stripePaymentId: session.payment_intent as string || undefined
        },
        include: {
          vehicle: true
        }
      })
      
      console.log('✅ [STRIPE WEBHOOK] Booking updated:', {
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        stripePaymentId: booking.stripePaymentId
      })

      // Format date for email
      const formattedDate = booking.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Send confirmation email to customer
      console.log('🟢 [STRIPE WEBHOOK] Sending confirmation emails...')
      try {
        console.log('🟢 [STRIPE WEBHOOK] Preparing customer email template...')
        const customerTemplate = emailTemplates.bookingConfirmation(
          booking.customerName,
          booking.id,
          booking.vehicle.name,
          formattedDate,
          booking.pickupLocation,
          booking.startTime,
          (booking as any).pickupNote || undefined,
          booking.dropoffLocation || undefined,
          (booking as any).dropoffNote || undefined
        )

        console.log('🟢 [STRIPE WEBHOOK] Sending email to customer:', booking.customerEmail)
        await sendEmail({
          to: booking.customerEmail,
          subject: customerTemplate.subject,
          html: customerTemplate.html
        })
        console.log('✅ [STRIPE WEBHOOK] Customer email sent successfully')

        // Send notification to admin (always zbklimo@gmail.com)
        console.log('🟢 [STRIPE WEBHOOK] Preparing admin notification template...')
        const adminTemplate = emailTemplates.adminNotification(
          booking.id,
          booking.customerName,
          booking.customerEmail,
          booking.customerPhone,
          booking.vehicle.name,
          booking.vehicle.model || '',
          booking.service,
          formattedDate,
          booking.startTime,
          booking.pickupLocation,
          booking.dropoffLocation || '',
          booking.duration,
          booking.totalAmount,
          booking.notes || undefined,
          (booking as any).serviceType || undefined,
          (booking as any).pickupNote || undefined,
          (booking as any).dropoffNote || undefined
        )

        const adminEmail = 'zbklimo@gmail.com' // Admin email is always zbklimo@gmail.com
        console.log('🟢 [STRIPE WEBHOOK] Sending email to admin:', adminEmail)
        await sendEmail({
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html
        })
        console.log('✅ [STRIPE WEBHOOK] Admin notification sent successfully')

        console.log('✅ [STRIPE WEBHOOK] Payment confirmed and emails sent')
        console.log('🟢 [STRIPE WEBHOOK]   - Customer email sent to:', booking.customerEmail)
        console.log('🟢 [STRIPE WEBHOOK]   - Admin notification sent to:', adminEmail)
      } catch (emailError) {
        console.error('❌ [STRIPE WEBHOOK] Failed to send payment confirmation emails')
        console.error('❌ [STRIPE WEBHOOK] Email error:', emailError)
        console.error('❌ [STRIPE WEBHOOK] Error stack:', (emailError as any)?.stack)
        // Don't fail the webhook if email fails
      }
    } else if (event.type === 'checkout.session.async_payment_failed') {
      console.log('🟢 [STRIPE WEBHOOK] Processing checkout.session.async_payment_failed event')
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      console.log('🟢 [STRIPE WEBHOOK] Payment failed details:', {
        sessionId: session.id,
        bookingId: bookingId,
        paymentStatus: session.payment_status
      })

      if (bookingId) {
        console.log('🟢 [STRIPE WEBHOOK] Updating booking to FAILED status...')
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'FAILED'
          }
        })
        console.log('✅ [STRIPE WEBHOOK] Booking updated to FAILED:', bookingId)
      } else {
        console.warn('⚠️ [STRIPE WEBHOOK] No booking ID found for failed payment')
      }
    } else {
      console.log('🟢 [STRIPE WEBHOOK] Unhandled event type:', event.type)
      console.log('🟢 [STRIPE WEBHOOK] Event ID:', event.id)
    }

    const duration = Date.now() - startTime
    console.log('✅ [STRIPE WEBHOOK] Webhook processed successfully')
    console.log('🟢 [STRIPE WEBHOOK] Processing time:', duration + 'ms')
    console.log('🟢 [STRIPE WEBHOOK] ==========================================')

    return NextResponse.json(
      { received: true },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      }
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('❌ [STRIPE WEBHOOK] ==========================================')
    console.error('❌ [STRIPE WEBHOOK] Error processing webhook')
    console.error('❌ [STRIPE WEBHOOK] Error type:', error.type || error.constructor.name)
    console.error('❌ [STRIPE WEBHOOK] Error message:', error.message)
    console.error('❌ [STRIPE WEBHOOK] Error stack:', error.stack)
    console.error('❌ [STRIPE WEBHOOK] Processing time:', duration + 'ms')
    console.error('❌ [STRIPE WEBHOOK] ==========================================')
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      }
    )
  }
}

