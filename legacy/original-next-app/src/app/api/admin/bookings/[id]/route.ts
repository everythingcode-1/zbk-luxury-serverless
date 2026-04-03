import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

// GET /api/admin/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    // Get current booking
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Payment condition: Cannot confirm booking without payment
    if (status === 'CONFIRMED' && currentBooking.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { 
          error: 'Cannot confirm booking without payment. Payment status must be PAID before confirming.',
          paymentStatus: currentBooking.paymentStatus,
          requiredPaymentStatus: 'PAID'
        },
        { status: 400 }
      )
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        notes: notes || currentBooking.notes,
        updatedAt: new Date()
      },
      include: {
        vehicle: true
      }
    })

    // Update vehicle status based on booking status
    if (status === 'CONFIRMED') {
      await prisma.vehicle.update({
        where: { id: currentBooking.vehicleId },
        data: { status: 'RESERVED' }
      })
    } else if (status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: currentBooking.vehicleId },
        data: { status: 'IN_USE' }
      })
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      await prisma.vehicle.update({
        where: { id: currentBooking.vehicleId },
        data: { status: 'AVAILABLE' }
      })
    }

    // Send status update email to customer
    if (status !== currentBooking.status) {
      const emailTemplate = emailTemplates.bookingStatusUpdate(
        currentBooking.customerName,
        currentBooking.id,
        status
      )

      await sendEmail({
        to: currentBooking.customerEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/bookings/[id] - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    await prisma.booking.delete({
      where: { id }
    })

    // Make vehicle available again
    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { status: 'AVAILABLE' }
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
