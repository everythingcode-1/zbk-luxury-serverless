import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

// GET /api/admin/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ]
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: {
          select: {
            name: true,
            model: true,
            plateNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to include payment status and deposit amount
    const bookingsWithPayment = bookings.map(booking => ({
      ...booking,
      paymentStatus: (booking as any).paymentStatus || 'PENDING',
      depositAmount: (booking as any).depositAmount || null,
      stripeSessionId: (booking as any).stripeSessionId || null,
    }))

    return NextResponse.json(bookingsWithPayment)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/admin/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      vehicleId,
      service,
      startDate,
      endDate,
      startTime,
      duration,
      pickupLocation,
      dropoffLocation,
      totalAmount,
      notes
    } = body

    // Check vehicle availability
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Vehicle is not available' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        vehicleId,
        service,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        duration,
        pickupLocation,
        dropoffLocation,
        totalAmount: parseFloat(totalAmount),
        notes,
        status: 'PENDING'
      },
      include: {
        vehicle: true
      }
    })

    // Format date
    const formattedDate = new Date(startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Send confirmation email to customer
    const customerEmailTemplate = emailTemplates.bookingConfirmation(
      customerName,
      booking.id,
      vehicle.name,
      formattedDate,
      pickupLocation,
      startTime
    )

    await sendEmail({
      to: customerEmail,
      subject: customerEmailTemplate.subject,
      html: customerEmailTemplate.html
    })

    // Send notification to admin (zbklimo@gmail.com)
    const adminEmailTemplate = emailTemplates.adminNotification(
      booking.id,
      customerName,
      customerEmail,
      customerPhone,
      vehicle.name,
      vehicle.model || '',
      service,
      formattedDate,
      startTime,
      pickupLocation,
      dropoffLocation || '',
      duration,
      parseFloat(totalAmount.toString()),
      notes || undefined
    )

    // Send to zbklimo@gmail.com (same email as sender)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'zbklimo@gmail.com',
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
