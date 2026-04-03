import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/vehicles - Get available vehicles for website (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const capacity = searchParams.get('capacity')

    // Build where clause
    const whereClause: any = {
      status: 'AVAILABLE'
    }

    if (category) {
      whereClause.category = category
    }

    if (capacity) {
      whereClause.capacity = {
        gte: parseInt(capacity)
      }
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: [
        {
          carouselOrder: 'asc' // Order by carousel order first (1, 2, 3, etc.)
        },
        {
          name: 'asc' // Then alphabetically by name for vehicles without carousel order
        }
      ]
    })

    // Transform data for public consumption
    const publicVehicles = vehicles.map((vehicle: any) => ({
      id: vehicle.id,
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category,
      capacity: vehicle.capacity,
      luggage: vehicle.luggage || 0,
      color: vehicle.color,
      features: vehicle.features,
      images: vehicle.images.length > 0 ? vehicle.images : ['/api/placeholder/800/600'],
      description: vehicle.description,
      location: vehicle.location,
      price: vehicle.price,
      priceAirportTransfer: vehicle.priceAirportTransfer || null,
      price6Hours: vehicle.price6Hours || null,
      price12Hours: vehicle.price12Hours || null,
      services: vehicle.services || [],
      minimumHours: vehicle.minimumHours || 1,
      displayName: `${vehicle.name} ${vehicle.model} (${vehicle.year})`,
      categoryDisplay: getCategoryDisplay(vehicle.category)
    }))

    return NextResponse.json({
      success: true,
      data: publicVehicles,
      total: publicVehicles.length,
      categories: [
        { value: 'WEDDING_AFFAIRS', label: 'Wedding Affairs', description: 'Perfect for your special day' },
        { value: 'AIRPORT_TRANSFER', label: 'Airport Transfer', description: 'Comfortable airport transportation' },
        { value: 'CITY_TOUR', label: 'City Tour', description: 'Explore the city in luxury' },
        { value: 'BUSINESS_TRIP', label: 'Business Trip', description: 'Professional business transportation' },
        { value: 'SPECIAL_EVENT', label: 'Special Event', description: 'For all your special occasions' }
      ]
    })

  } catch (error) {
    console.error('Error fetching public vehicles:', error)
    
    // Fallback to mock data if database fails
    const mockVehicles = [
      {
        id: 'mock-1',
        name: 'Mercedes S-Class',
        model: 'S450',
        year: 2024,
        category: 'WEDDING_AFFAIRS',
        capacity: 4,
        color: 'Black',
        features: ['Leather Seats', 'Sunroof', 'Premium Audio', 'GPS Navigation'],
        images: ['/api/placeholder/800/600'],
        description: 'Luxury sedan perfect for special occasions and business trips.',
        location: 'Jakarta',
        displayName: 'Mercedes S-Class S450 (2024)',
        categoryDisplay: 'Wedding Affairs'
      },
      {
        id: 'mock-2',
        name: 'BMW X7',
        model: 'xDrive40i',
        year: 2024,
        category: 'AIRPORT_TRANSFER',
        capacity: 7,
        color: 'White',
        features: ['7 Seats', 'Premium Sound', 'Panoramic Roof', 'Ambient Lighting'],
        images: ['/api/placeholder/800/600'],
        description: 'Spacious luxury SUV ideal for family trips and group transportation.',
        location: 'Jakarta',
        displayName: 'BMW X7 xDrive40i (2024)',
        categoryDisplay: 'Airport Transfer'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockVehicles,
      total: mockVehicles.length,
      fallback: true,
      categories: [
        { value: 'WEDDING_AFFAIRS', label: 'Wedding Affairs', description: 'Perfect for your special day' },
        { value: 'AIRPORT_TRANSFER', label: 'Airport Transfer', description: 'Comfortable airport transportation' },
        { value: 'CITY_TOUR', label: 'City Tour', description: 'Explore the city in luxury' },
        { value: 'BUSINESS_TRIP', label: 'Business Trip', description: 'Professional business transportation' },
        { value: 'SPECIAL_EVENT', label: 'Special Event', description: 'For all your special occasions' }
      ]
    })
  }
}

function getCategoryDisplay(category: string): string {
  switch (category) {
    case 'WEDDING_AFFAIRS': return 'Wedding Affairs'
    case 'AIRPORT_TRANSFER': return 'Airport Transfer'
    case 'CITY_TOUR': return 'City Tour'
    case 'BUSINESS_TRIP': return 'Business Trip'
    case 'SPECIAL_EVENT': return 'Special Event'
    default: return category
  }
}
