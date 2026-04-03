import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBookingPriceNew } from '@/utils/pricing'

// GET /api/bookings - Get all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
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
    
    return NextResponse.json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings'
    }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log incoming request for debugging
    console.log('📝 Booking request received:', {
      vehicleId: body.vehicleId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      service: body.service,
      serviceType: body.serviceType,
      startDate: body.startDate,
      endDate: body.endDate,
      pickupLocation: body.pickupLocation,
      dropoffLocation: body.dropoffLocation
    })
    
    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'vehicleId', 'startDate', 'pickupLocation']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }
    
    // Get vehicle details for price calculation
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
      select: {
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

    if (!vehicle) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle not found'
      }, { status: 404 })
    }

    // Calculate total amount based on service type and duration
    const hoursMatch = (body.duration || '6 hours').match(/\d+/);
    const hours = hoursMatch ? parseInt(hoursMatch[0]) : 6;
    
    let serviceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL' = 'RENTAL';
    
    // Determine service type from body or from locations
    if (body.serviceType) {
      serviceType = body.serviceType;
    } else {
      // Fallback: detect from service field or locations
      const serviceStr = (body.service || '').toUpperCase();
      const pickupLower = (body.pickupLocation || '').toLowerCase();
      const dropoffLower = (body.dropoffLocation || '').toLowerCase();
      
      const isOneWay = serviceStr.includes('ONE') || 
                       serviceStr.includes('ONE-WAY') || 
                       serviceStr.includes('TRIP') || 
                       serviceStr.includes('AIRPORT');
      
      if (isOneWay) {
        // Airport keywords and names
        const airportKeywords = ['airport', 'terminal', 'bandara', 'arrival', 'departure', 'flight', 'gate'];
        const airportNames = [
          'ngurah rai', 'denpasar', 'dps', 'changi', 'singapore airport', 'sin',
          'soekarno-hatta', 'soekarno hatta', 'soetta', 'cengkareng', 'cgk',
          'juanda', 'sub', 'halim', 'lombok airport', 'praya', 'lop',
          'klia', 'kul', 'suvarnabhumi', 'bkk', 'don mueang', 'dmk', 'hkg', 'hkt'
        ];
        
        const checkLocation = (location: string) => {
          return airportKeywords.some(kw => location.includes(kw)) || 
                 airportNames.some(name => location.includes(name));
        };
        
        const isAirportRelated = checkLocation(pickupLower) || checkLocation(dropoffLower);
        
        serviceType = isAirportRelated ? 'AIRPORT_TRANSFER' : 'TRIP';
      } else {
        serviceType = 'RENTAL';
      }
    }
    
    // Calculate price using new pricing logic
    const priceCalculation = calculateBookingPriceNew({
      vehicle: {
        priceAirportTransfer: vehicle.priceAirportTransfer,
        price6Hours: vehicle.price6Hours,
        price12Hours: vehicle.price12Hours,
        pricePerHour: vehicle.pricePerHour
      },
      serviceType,
      pickupLocation: body.pickupLocation,
      dropoffLocation: body.dropoffLocation,
      startTime: body.startTime,
      startDate: body.startDate,
      hours: serviceType === 'RENTAL' ? hours : 0
    });
    
    const totalAmount = priceCalculation.total;
    
    console.log('💰 Calculated pricing:', {
      serviceType,
      subtotal: priceCalculation.subtotal,
      midnightCharge: priceCalculation.midnightCharge,
      totalAmount,
      hours,
      breakdown: priceCalculation.breakdown
    })
    
    const booking = await prisma.booking.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        vehicleId: body.vehicleId,
        service: body.service || serviceType, // Keep legacy field
        serviceType: serviceType, // New field
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
        startTime: body.startTime || '09:00',
        duration: body.duration || '8 hours',
        pickupLocation: body.pickupLocation,
        dropoffLocation: body.dropoffLocation || body.pickupLocation,
        pickupNote: body.pickupNote || null,
        dropoffNote: body.dropoffNote || null,
        totalAmount: totalAmount,
        status: body.status || 'PENDING',
        notes: body.notes || '',
      },
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
    
    // NOTE: Email notifications will be sent after payment confirmation via webhook
    // This ensures emails are only sent when payment is successful
    
    console.log('✅ Booking created successfully:', booking.id)
    
    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully. Please proceed to payment.'
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating booking:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
