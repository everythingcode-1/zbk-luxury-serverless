import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vehicles/[id] - Get single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id
      },
      include: {
        bookings: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        maintenanceRecords: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    })
    
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vehicle'
    }, { status: 500 })
  }
}

// PUT /api/vehicles/[id] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Build update data object conditionally
    const updateData: any = {
      name: body.name,
      model: body.model,
      year: parseInt(body.year) || body.year,
      status: body.status,
      location: body.location,
      plateNumber: body.plateNumber,
      capacity: parseInt(body.capacity) || body.capacity,
      color: body.color,
      mileage: body.mileage,
      features: body.features,
      images: body.images,
      description: body.description,
    }

    // Add optional fields only if they are provided
    if (body.luggage !== undefined) {
      updateData.luggage = body.luggage ? parseInt(body.luggage) : null
    }
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price)
    }
    if (body.priceAirportTransfer !== undefined) {
      updateData.priceAirportTransfer = parseFloat(body.priceAirportTransfer)
    }
    if (body.pricePerHour !== undefined) {
      updateData.pricePerHour = parseFloat(body.pricePerHour)
    }
    if (body.price6Hours !== undefined) {
      updateData.price6Hours = parseFloat(body.price6Hours)
    }
    if (body.price12Hours !== undefined) {
      updateData.price12Hours = parseFloat(body.price12Hours)
    }
    if (body.services !== undefined) {
      updateData.services = body.services
    }
    if (body.minimumHours !== undefined) {
      updateData.minimumHours = body.minimumHours ? parseInt(body.minimumHours) : null
    }
    if (body.carouselOrder !== undefined) {
      updateData.carouselOrder = body.carouselOrder ? parseInt(body.carouselOrder) : null
    }
    if (body.lastMaintenance) {
      updateData.lastMaintenance = new Date(body.lastMaintenance)
    }
    if (body.nextMaintenance) {
      updateData.nextMaintenance = new Date(body.nextMaintenance)
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id
      },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update vehicle'
    }, { status: 500 })
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.vehicle.delete({
      where: {
        id
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete vehicle'
    }, { status: 500 })
  }
}
