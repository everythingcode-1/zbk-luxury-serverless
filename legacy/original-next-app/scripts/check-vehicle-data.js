const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVehicleData() {
  try {
    console.log('🔍 Checking vehicle data in database...')
    
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        minimumHours: true,
        category: true
      }
    })
    
    console.log('📊 Vehicle data:')
    vehicles.forEach(vehicle => {
      console.log(`- ${vehicle.name}: $${vehicle.price}/hour, min ${vehicle.minimumHours}h`)
    })
    
    // Check schema info
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      AND column_name IN ('price', 'minimumHours')
      ORDER BY column_name;
    `
    
    console.log('\n🗄️ Database schema for price fields:')
    console.log(tableInfo)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVehicleData()
