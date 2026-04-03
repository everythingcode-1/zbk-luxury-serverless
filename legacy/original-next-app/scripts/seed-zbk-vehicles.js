const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('👤 Seeding admin user...');

  try {
    const adminEmail = 'zbklimo@gmail.com';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('Zbkpassword2025', 10);
      
      // Update password
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin password updated');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Zbkpassword2025', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'ZBK Limo Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created:', admin.email);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
}

async function seedZBKVehicles() {
  console.log('🚗 Seeding ZBK vehicles...');

  try {
    // Check if vehicles already exist
    const existingVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { name: 'Toyota Alphard' },
          { name: 'Toyota Noah' },
          { name: 'Toyota Combi' }
        ]
      }
    });

    if (existingVehicles.length > 0) {
      console.log('⚠️  Vehicles already exist. Updating...');
      
      // Update existing vehicles
      for (const vehicle of existingVehicles) {
        let updateData = {};
        
        if (vehicle.name === 'Toyota Alphard') {
          updateData = {
            priceAirportTransfer: 80,
            price6Hours: 360,
            price12Hours: 720,
            pricePerHour: 60,
            capacity: 6,
            luggage: 4,
            services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT']
          };
        } else if (vehicle.name === 'Toyota Noah') {
          updateData = {
            priceAirportTransfer: 75,
            price6Hours: 360,
            price12Hours: 660,
            pricePerHour: 60,
            capacity: 6,
            luggage: 4,
            services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT']
          };
        } else if (vehicle.name === 'Toyota Combi') {
          updateData = {
            priceAirportTransfer: 90,
            price6Hours: 390,
            price12Hours: 720,
            pricePerHour: 65,
            capacity: 9,
            luggage: 8,
            services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT']
          };
        }
        
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: updateData
        });
        
        console.log(`✅ Updated ${vehicle.name}`);
      }
      
      console.log('✨ All vehicles updated successfully!');
      return;
    }

    // Create new vehicles
    const vehicles = [
      {
        name: 'Toyota Alphard',
        model: 'Executive Lounge',
        year: 2024,
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B 1234 ZBK',
        capacity: 6,
        luggage: 4,
        color: 'Black',
        price: 60, // Legacy price (fallback, not actively used)
        priceAirportTransfer: 80,
        price6Hours: 360,
        price12Hours: 720,
        pricePerHour: 60, // Used for TRIP service and additional rental hours
        services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT'],
        minimumHours: 6,
        purchaseDate: new Date('2024-01-01'),
        purchasePrice: 150000,
        mileage: '5000 km',
        features: [
          'Luxury Leather Seats',
          'Captain Seats',
          'Premium Sound System',
          'Sunroof',
          'GPS Navigation',
          'WiFi',
          'USB Charging Ports',
          'Climate Control'
        ],
        images: [
          '/4.-alphard-colors-black.png',
          '/uploads/vehicles/vehicle_1765222010292_hujq2sa7a9i.png'
        ],
        description: 'Premium luxury MPV perfect for executive travel, airport transfers, and special occasions. Features spacious captain seats and top-tier comfort.',
        lastMaintenance: new Date('2024-11-01'),
        nextMaintenance: new Date('2025-02-01')
      },
      {
        name: 'Toyota Noah',
        model: 'Si GR Sport',
        year: 2024,
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B 5678 ZBK',
        capacity: 6,
        luggage: 4,
        color: 'White Pearl',
        price: 55, // Legacy price (fallback, not actively used)
        priceAirportTransfer: 75,
        price6Hours: 360,
        price12Hours: 660,
        pricePerHour: 60, // Used for TRIP service and additional rental hours
        services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT'],
        minimumHours: 6,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 95000,
        mileage: '3000 km',
        features: [
          'Comfortable Seating',
          'Air Conditioning',
          'Audio System',
          'USB Ports',
          'Spacious Interior',
          'Safety Features',
          'Power Windows',
          'Central Locking'
        ],
        images: [
          '/uploads/vehicles/vehicle_1764678647308_zeawpc0v37s.webp',
          '/uploads/vehicles/vehicle_1764576026470_qc4xxtp7iea.png'
        ],
        description: 'Versatile and comfortable MPV ideal for family trips, airport transfers, and group transportation. Offers excellent value with premium features.',
        lastMaintenance: new Date('2024-11-15'),
        nextMaintenance: new Date('2025-02-15')
      },
      {
        name: 'Toyota Combi',
        model: 'Hiace Premium',
        year: 2024,
        status: 'AVAILABLE',
        location: 'Jakarta',
        plateNumber: 'B 9012 ZBK',
        capacity: 9,
        luggage: 8,
        color: 'Silver',
        price: 65, // Legacy price (fallback, not actively used)
        priceAirportTransfer: 90,
        price6Hours: 390,
        price12Hours: 720,
        pricePerHour: 65, // Used for TRIP service and additional rental hours
        services: ['AIRPORT_TRANSFER', 'TRIP', 'RENT'],
        minimumHours: 6,
        purchaseDate: new Date('2024-02-01'),
        purchasePrice: 85000,
        mileage: '4000 km',
        features: [
          'Spacious 9 Seater',
          'Large Luggage Space',
          'Air Conditioning',
          'Entertainment System',
          'USB Charging',
          'Comfortable Seats',
          'Safety Features',
          'Power Steering'
        ],
        images: [
          '/uploads/vehicles/vehicle_1764678668512_98ca8kq19xg.webp',
          '/uploads/vehicles/vehicle_1764576026470_qc4xxtp7iea.png'
        ],
        description: 'Spacious combi perfect for large groups, airport transfers, and extended trips. Accommodates up to 9 passengers with ample luggage space.',
        lastMaintenance: new Date('2024-11-20'),
        nextMaintenance: new Date('2025-02-20')
      }
    ];

    // Create vehicles
    for (const vehicleData of vehicles) {
      const vehicle = await prisma.vehicle.create({
        data: vehicleData
      });
      console.log(`✅ Created ${vehicle.name} (${vehicle.model})`);
    }

    console.log('✨ Successfully seeded ZBK vehicles!');
    console.log('\n📋 Vehicle Summary:');
    console.log('1. Toyota Alphard - 6 pax, 4 luggage');
    console.log('   - Airport Transfer: $80');
    console.log('   - 6 Hours: $360');
    console.log('   - 12 Hours: $720');
    console.log('\n2. Toyota Noah - 6 pax, 4 luggage');
    console.log('   - Airport Transfer: $75');
    console.log('   - 6 Hours: $360');
    console.log('   - 12 Hours: $660');
    console.log('\n3. Toyota Combi - 9 pax, 8 luggage');
    console.log('   - Airport Transfer: $90');
    console.log('   - 6 Hours: $390');
    console.log('   - 12 Hours: $720');

  } catch (error) {
    console.error('❌ Error seeding vehicles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeders
async function runSeeders() {
  console.log('🌱 Starting seeding process...\n');
  
  try {
    // Seed admin first
    await seedAdmin();
    console.log('');
    
    // Then seed vehicles
    await seedZBKVehicles();
    
    console.log('\n✅ All seeding completed!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: zbklimo@gmail.com');
    console.log('   Password: Zbkpassword2025');
    console.log('   Role: ADMIN');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

runSeeders()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

