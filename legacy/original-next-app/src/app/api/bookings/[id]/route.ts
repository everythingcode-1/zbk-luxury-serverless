import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            name: true,
            model: true,
            plateNumber: true,
            images: true
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

    return NextResponse.json({
      success: true,
      data: booking
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch booking'
    }, { status: 500 })
  }
}

