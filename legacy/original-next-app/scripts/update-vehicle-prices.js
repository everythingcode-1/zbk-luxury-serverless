const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateVehiclePrices() {
  console.log('🔄 Updating vehicle prices and capacity based on ZBK Price List...')

  try {
    // Update Alphard vehicles
    const alphardVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { name: { contains: 'ALPHARD', mode: 'insensitive' } },
          { category: 'ALPHARD_PREMIUM' },
          { category: 'WEDDING_AFFAIRS' }
        ]
      }
    })

    for (const vehicle of alphardVehicles) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          capacity: 6, // 6 pax 4 luggage
          price: 60, // Base hourly rate (for calculation purposes)
          description: vehicle.description || 'Luxury Toyota Alphard. Airport Transfer: $80 | 6hrs: $360 | 12hrs: $720 | Capacity: 6 pax, 4 luggage'
        }
      })
      console.log(`✅ Updated: ${vehicle.name} - Capacity: 6 pax, 4 luggage`)
    }

    // Update Noah vehicles (if any)
    const noahVehicles = await prisma.vehicle.findMany({
      where: {
        name: { contains: 'NOAH', mode: 'insensitive' }
      }
    })

    for (const vehicle of noahVehicles) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          capacity: 6, // 6 pax 4 luggage
          price: 55, // Base hourly rate
          description: vehicle.description || 'Toyota Noah. Airport Transfer: $75 | 6hrs: $360 | 12hrs: $660 | Capacity: 6 pax, 4 luggage'
        }
      })
      console.log(`✅ Updated: ${vehicle.name} - Capacity: 6 pax, 4 luggage`)
    }

    // Update Combi vehicles
    const combiVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { name: { contains: 'COMBI', mode: 'insensitive' } },
          { name: { contains: 'HIACE', mode: 'insensitive' } },
          { category: 'COMBI_TRANSPORT' }
        ]
      }
    })

    for (const vehicle of combiVehicles) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          capacity: 9, // 9 pax 8 luggage
          price: 65, // Base hourly rate
          description: vehicle.description || 'Toyota Hiace Combi. Airport Transfer: $90 | 6hrs: $390 | 12hrs: $720 | Capacity: 9 pax, 8 luggage'
        }
      })
      console.log(`✅ Updated: ${vehicle.name} - Capacity: 9 pax, 8 luggage`)
    }

    console.log('\n📋 ZBK Price List Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Alphard:')
    console.log('  - Airport Transfer: $80')
    console.log('  - 6 hrs bookings: $360')
    console.log('  - 12 hrs bookings: $720')
    console.log('  - Capacity: 6 pax, 4 luggage')
    console.log('')
    console.log('Noah:')
    console.log('  - Airport transfer: $75')
    console.log('  - 6 hrs bookings: $360')
    console.log('  - 12 hrs bookings: $660')
    console.log('  - Capacity: 6 pax, 4 luggage')
    console.log('')
    console.log('Combi:')
    console.log('  - Airport Transfer: $90')
    console.log('  - 6hrs bookings: $390')
    console.log('  - 12 hrs bookings: $720')
    console.log('  - Capacity: 9 pax, 8 luggage')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🎉 Vehicle prices and capacity updated successfully!')
    console.log('💡 Note: Actual pricing is calculated by the pricing utility function based on service type and duration.')

  } catch (error) {
    console.error('❌ Error updating vehicle prices:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateVehiclePrices()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

