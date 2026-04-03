const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@zbkluxury.com' },
      update: {},
      create: {
        email: 'admin@zbkluxury.com',
        name: 'ZBK Admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created:', adminUser.email)

    // Create Wedding Affairs Toyota Alphard
    const weddingAlphard = await prisma.vehicle.upsert({
      where: { plateNumber: 'B-1234-WED' },
      update: {},
      create: {
        name: 'TOYOTA ALPHARD',
        model: 'ALPHARD',
        year: 2024,
        category: 'WEDDING_AFFAIRS',
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B-1234-WED',
        capacity: 7,
        color: 'Black',
        price: 300.00,
        minimumHours: 5,
        purchaseDate: new Date('2024-01-01'),
        purchasePrice: 150000.00,
        mileage: '15000 km',
        features: [
          'Wedding Function Specialist',
          'Premium Interior',
          'Professional Chauffeur',
          'Wedding Decoration Ready',
          'Air Conditioning',
          'Sound System',
          'Leather Seats',
          'Privacy Glass'
        ],
        images: [
          '/4.-alphard-colors-black.png',
          '/vehicles/wedding-alphard-2.jpg',
          '/vehicles/wedding-alphard-3.jpg'
        ],
        description: 'Luxury Toyota Alphard specially prepared for wedding functions. Minimum 5 hours booking with professional chauffeur service.'
      }
    })
    console.log('✅ Wedding Alphard created:', weddingAlphard.name)

    // Create Alphard/Vellfire Premium
    const alphardVellfire = await prisma.vehicle.upsert({
      where: { plateNumber: 'B-5678-LUX' },
      update: {},
      create: {
        name: 'TOYOTA ALPHARD / VELLFIRE',
        model: 'ALPHARD/VELLFIRE',
        year: 2024,
        category: 'ALPHARD_PREMIUM',
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B-5678-LUX',
        capacity: 4,
        color: 'Pearl White',
        price: 140.00,
        minimumHours: 3,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 160000.00,
        mileage: '8000 km',
        features: [
          'Premium Executive Seating',
          'Captain Chairs',
          'Entertainment System',
          'Mini Bar',
          'Air Conditioning',
          'WiFi Hotspot',
          'USB Charging Ports',
          'Privacy Curtains',
          'Massage Seats',
          'Premium Sound System'
        ],
        images: [
          '/4.-alphard-colors-black.png',
          '/vehicles/alphard-vellfire-2.jpg',
          '/vehicles/alphard-vellfire-3.jpg'
        ],
        description: 'Premium Toyota Alphard/Vellfire with executive seating for 4 passengers. Perfect for business meetings and luxury transportation.'
      }
    })
    console.log('✅ Alphard/Vellfire created:', alphardVellfire.name)

    // Create Hiace Combi
    const hiaceCombi = await prisma.vehicle.upsert({
      where: { plateNumber: 'B-9999-CMB' },
      update: {},
      create: {
        name: 'TOYOTA HIACE COMBI 13 SEATER',
        model: 'HIACE',
        year: 2024,
        category: 'COMBI_TRANSPORT',
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B-9999-CMB',
        capacity: 12,
        color: 'White',
        price: 360.00,
        minimumHours: 4,
        purchaseDate: new Date('2024-01-01'),
        purchasePrice: 80000.00,
        mileage: '25000 km',
        features: [
          'Large Group Transport',
          '13 Seater Capacity',
          'Air Conditioning',
          'Comfortable Seating',
          'Luggage Space',
          'Professional Driver'
        ],
        images: [
          '/4.-alphard-colors-black.png',
          '/vehicles/hiace-2.jpg',
          '/vehicles/hiace-3.jpg'
        ],
        description: 'Spacious Toyota Hiace Combi perfect for group transportation. Ideal for family trips, corporate events, and group tours.'
      }
    })
    console.log('✅ Hiace Combi created:', hiaceCombi.name)

    console.log('🎉 Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
