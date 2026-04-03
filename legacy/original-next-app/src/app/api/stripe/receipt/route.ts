import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

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

// GET /api/stripe/receipt?session_id=xxx or ?booking_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const bookingId = searchParams.get('booking_id')

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
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
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
            vehicle: {
              select: {
                name: true,
                model: true,
                plateNumber: true
              }
            }
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

    // Get payment intent details if available
    let paymentIntent: Stripe.PaymentIntent | null = null
    if (session?.payment_intent) {
      try {
        if (typeof session.payment_intent === 'string') {
          paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
        }
      } catch (error) {
        console.error('Error retrieving payment intent:', error)
      }
    }

    // Get charge details if available
    let charge: Stripe.Charge | null = null
    if (paymentIntent?.latest_charge) {
      try {
        if (typeof paymentIntent.latest_charge === 'string') {
          charge = await stripe.charges.retrieve(paymentIntent.latest_charge)
        }
      } catch (error) {
        console.error('Error retrieving charge:', error)
      }
    }

    // Format receipt data
    const receipt = {
      receiptNumber: session?.id || booking.id,
      transactionId: paymentIntent?.id || session?.payment_intent || booking.stripePaymentId || 'N/A',
      bookingId: booking.id,
      paymentDate: session?.created ? new Date(session.created * 1000).toISOString() : booking.updatedAt.toISOString(),
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      vehicle: {
        name: booking.vehicle.name,
        model: booking.vehicle.model,
        plateNumber: booking.vehicle.plateNumber
      },
      service: booking.service,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupNote: (booking as any).pickupNote || null,
      dropoffNote: (booking as any).dropoffNote || null,
      startDate: booking.startDate.toISOString(),
      startTime: booking.startTime,
      duration: booking.duration,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount || 0,
      amountPaid: session?.amount_total ? session.amount_total / 100 : (booking.depositAmount || 0),
      currency: session?.currency?.toUpperCase() || 'SGD',
      paymentStatus: booking.paymentStatus,
      paymentMethod: charge?.payment_method_details?.type || session?.payment_method_types?.[0] || 'card',
      cardBrand: charge?.payment_method_details?.card?.brand || null,
      cardLast4: charge?.payment_method_details?.card?.last4 || null,
      status: booking.status,
      stripeSessionUrl: session?.url || null,
      invoiceUrl: charge?.receipt_url || 
        (typeof session?.invoice === 'object' && session.invoice !== null 
          ? (session.invoice as Stripe.Invoice).hosted_invoice_url || null
          : null)
    }

    return NextResponse.json({
      success: true,
      data: receipt
    })

  } catch (error: any) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}

