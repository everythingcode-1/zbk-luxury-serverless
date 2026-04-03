import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...')
  
  // Delete all existing vehicles first
  console.log('🗑️  Deleting existing vehicles...')
  await prisma.vehicle.deleteMany({})
  console.log('✅ Existing vehicles deleted')

  // Vehicle 1: Toyota Alphard
  const alphard = await prisma.vehicle.create({
    data: {
      name: 'TOYOTA ALPHARD',
      model: 'ALPHARD',
      year: 2024,
      status: 'AVAILABLE',
      location: 'Singapore',
      plateNumber: 'SGX-ALPHARD-001',
      capacity: 6, // 6 passengers
      luggage: 4, // 4 luggage
      color: 'Black',
      price: 60.00, // Legacy: per hour (not used)
      priceAirportTransfer: 80.00, // Airport Transfer: $80
      price6Hours: 360.00, // 6 hours booking: $360
      price12Hours: 720.00, // 12 hours booking: $720
      pricePerHour: 60.00, // Per hour price: $60 (for TRIP service and additional rental hours)
      services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'], // All services available
      minimumHours: 6, // Minimum 6 hours for rental
      carouselOrder: 1, // Display order: #1
      purchaseDate: new Date('2024-01-01'),
      purchasePrice: 150000.00,
      mileage: '15000 km',
      features: [
        'Premium Executive Seating',
        'Captain Chairs',
        'Entertainment System',
        'Air Conditioning',
        'WiFi Hotspot',
        'USB Charging Ports',
        'Privacy Curtains',
        'Leather Seats',
        'Professional Chauffeur'
      ],
      images: [
        '/4.-alphard-colors-black.png',
        '/vehicles/alphard-2.jpg',
        '/vehicles/alphard-3.jpg'
      ],
      description: 'Luxury Toyota Alphard with premium seating for 6 passengers and 4 luggage capacity. Perfect for airport transfers, trips, and hourly rentals. Features executive amenities and professional chauffeur service.'
    }
  })

  // Vehicle 2: Toyota Noah
  const noah = await prisma.vehicle.create({
    data: {
      name: 'TOYOTA NOAH',
      model: 'NOAH',
      year: 2024,
      status: 'AVAILABLE',
      location: 'Singapore',
      plateNumber: 'SGX-NOAH-001',
      capacity: 6, // 6 passengers
      luggage: 4, // 4 luggage
      color: 'Silver',
      price: 50.00, // Legacy: per hour (not used)
      priceAirportTransfer: 75.00, // Airport Transfer: $75
      price6Hours: 360.00, // 6 hours booking: $360
      price12Hours: 660.00, // 12 hours booking: $660
      pricePerHour: 60.00, // Per hour price: $60 (for TRIP service and additional rental hours)
      services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'], // All services available
      minimumHours: 6, // Minimum 6 hours for rental
      carouselOrder: 2, // Display order: #2
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 90000.00,
      mileage: '8000 km',
      features: [
        'Comfortable Seating',
        'Family Friendly',
        'Spacious Interior',
        'Air Conditioning',
        'USB Charging Ports',
        'Entertainment System',
        'Safety Features',
        'Professional Driver'
      ],
      images: [
        '/4.-alphard-colors-black.png',
        '/vehicles/noah-2.jpg',
        '/vehicles/noah-3.jpg'
      ],
      description: 'Comfortable Toyota Noah perfect for families and small groups. Seats 6 passengers with 4 luggage capacity. Ideal for airport transfers, trips, and hourly rentals with professional driver service.'
    }
  })

  // Vehicle 3: Combi (Toyota Hiace)
  const combi = await prisma.vehicle.create({
    data: {
      name: 'TOYOTA HIACE COMBI',
      model: 'HIACE',
      year: 2023,
      status: 'AVAILABLE',
      location: 'Singapore',
      plateNumber: 'SGX-COMBI-001',
      capacity: 9, // 9 passengers
      luggage: 8, // 8 luggage
      color: 'White',
      price: 70.00, // Legacy: per hour (not used)
      priceAirportTransfer: 90.00, // Airport Transfer: $90
      price6Hours: 390.00, // 6 hours booking: $390
      price12Hours: 720.00, // 12 hours booking: $720
      pricePerHour: 65.00, // Per hour price: $65 (for TRIP service and additional rental hours)
      services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'], // All services available
      minimumHours: 6, // Minimum 6 hours for rental
      carouselOrder: 3, // Display order: #3
      purchaseDate: new Date('2023-06-01'),
      purchasePrice: 85000.00,
      mileage: '25000 km',
      features: [
        'Large Group Transport',
        '9 Passenger Seats',
        'Spacious Luggage Area (8 luggage)',
        'Air Conditioning',
        'Reclining Seats',
        'USB Charging Ports',
        'Safety Features',
        'Professional Driver'
      ],
      images: [
        '/4.-alphard-colors-black.png',
        '/vehicles/combi-2.jpg',
        '/vehicles/combi-3.jpg'
      ],
      description: 'Spacious Toyota Hiace Combi for larger groups. Seats 9 passengers with 8 luggage capacity. Perfect for airport transfers, group trips, and hourly rentals. Ideal for family outings and corporate events.'
    }
  })

  console.log('✅ Vehicles seeded successfully!')
  console.log(`Alphard (Order: 1): ${alphard.id} - Airport: $80, Per Hour: $60, 6hrs: $360, 12hrs: $720`)
  console.log(`Noah (Order: 2): ${noah.id} - Airport: $75, Per Hour: $60, 6hrs: $360, 12hrs: $660`)
  console.log(`Combi (Order: 3): ${combi.id} - Airport: $90, Per Hour: $65, 6hrs: $390, 12hrs: $720`)
}

async function main() {
  try {
    await seedVehicles()
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()

export { seedVehicles }
