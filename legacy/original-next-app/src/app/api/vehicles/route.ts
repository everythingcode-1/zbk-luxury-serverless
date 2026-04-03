import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vehicleData, getAvailableVehicles } from '@/data/vehicleData'

// GET /api/vehicles - Get all vehicles
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: [
        {
          carouselOrder: 'asc' // Order by carousel order first (1, 2, 3, etc.)
        },
        {
          createdAt: 'desc' // Then by creation date for vehicles without carousel order
        }
      ]
    })
    
    return NextResponse.json({
      success: true,
      data: vehicles
    })
  } catch (error) {
    console.error('Database error, using updated vehicle data:', error)
    
    // Use the new vehicle data from extracted information
    return NextResponse.json({
      success: true,
      data: vehicleData,
      fallback: true,
      message: 'Using updated vehicle data - database not connected'
    })
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const vehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        model: body.model,
        year: body.year,
        status: body.status || 'AVAILABLE',
        location: body.location,
        plateNumber: body.plateNumber,
        capacity: body.capacity,
        luggage: body.luggage || null,
        color: body.color,
        price: body.price !== undefined ? body.price : null,
        priceAirportTransfer: body.priceAirportTransfer || null,
        pricePerHour: body.pricePerHour || null,
        price6Hours: body.price6Hours || null,
        price12Hours: body.price12Hours || null,
        services: body.services || [],
        minimumHours: body.minimumHours || 6,
        purchaseDate: new Date(), // Set to current date as default
        purchasePrice: 0, // Set to 0 as default
        mileage: body.mileage,
        features: body.features || [],
        images: body.images || [],
        description: body.description,
        lastMaintenance: body.lastMaintenance ? new Date(body.lastMaintenance) : null,
        nextMaintenance: body.nextMaintenance ? new Date(body.nextMaintenance) : null,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: vehicle
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create vehicle'
    }, { status: 500 })
  }
}
