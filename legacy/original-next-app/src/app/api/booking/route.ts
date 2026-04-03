import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { calculateBookingPriceNew } from '@/utils/pricing'

// POST /api/booking - Create booking from website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      vehicleId,
      service,
      serviceType,
      startDate,
      endDate,
      startTime,
      duration,
      pickupLocation,
      dropoffLocation,
      notes
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !vehicleId || !service || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the specified vehicle
    const availableVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        model: true,
        price: true,
        priceAirportTransfer: true,
        price6Hours: true,
        price12Hours: true,
        pricePerHour: true,
        services: true,
        minimumHours: true
      }
    })

    if (!availableVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not available' },
        { status: 400 }
      )
    }

    // Calculate price based on service type and duration
    const durationHours = parseInt((duration || '6 hours').replace(' hours', '').replace(' hour', '')) || 6
    
    // Determine service type
    let finalServiceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL' = serviceType || 'RENTAL'
    
    if (!serviceType) {
      // Auto-detect from location
      const pickupLower = (pickupLocation || '').toLowerCase()
      const dropoffLower = (dropoffLocation || '').toLowerCase()
      const isAirportRelated = pickupLower.includes('airport') || 
                               pickupLower.includes('terminal') ||
                               dropoffLower.includes('airport') || 
                               dropoffLower.includes('terminal')
      
      const serviceStr = (service || '').toUpperCase()
      const isOneWay = serviceStr.includes('ONE') || 
                       serviceStr.includes('ONE-WAY') || 
                       serviceStr.includes('TRIP') || 
                       serviceStr.includes('AIRPORT')
      
      if (isOneWay) {
        finalServiceType = isAirportRelated ? 'AIRPORT_TRANSFER' : 'TRIP'
      } else {
        finalServiceType = 'RENTAL'
      }
    }
    
    // Calculate price using new pricing logic
    const priceCalculation = calculateBookingPriceNew({
      vehicle: {
        priceAirportTransfer: availableVehicle.priceAirportTransfer,
        price6Hours: availableVehicle.price6Hours,
        price12Hours: availableVehicle.price12Hours,
        pricePerHour: availableVehicle.pricePerHour
      },
      serviceType: finalServiceType,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      startTime: startTime,
      startDate: startDate,
      hours: finalServiceType === 'RENTAL' ? durationHours : 0
    })
    
    const totalAmount = priceCalculation.total

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        vehicleId: availableVehicle.id,
        service,
        serviceType: finalServiceType,
        startDate: new Date(startDate),
        endDate: new Date(endDate || startDate),
        startTime: startTime || '09:00',
        duration: duration || '6 hours',
        pickupLocation,
        dropoffLocation,
        totalAmount,
        notes,
        status: 'PENDING'
      },
      include: {
        vehicle: true
      }
    })

    // Update vehicle status to reserved
    await prisma.vehicle.update({
      where: { id: availableVehicle.id },
      data: { status: 'RESERVED' }
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
      availableVehicle.name,
      formattedDate,
      pickupLocation,
      startTime || '09:00'
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
      availableVehicle.name,
      availableVehicle.model || '',
      service,
      formattedDate,
      startTime || '09:00',
      pickupLocation,
      dropoffLocation || '',
      duration || '6 hours',
      totalAmount,
      notes || undefined,
      finalServiceType
    )

    // Send to zbklimo@gmail.com (same email as sender)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'zbklimo@gmail.com',
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html
    })

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully. You will receive a confirmation email shortly.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}
