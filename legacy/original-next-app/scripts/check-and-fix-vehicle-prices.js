/**
 * Script to check and fix vehicle prices
 * 
 * This script checks if all vehicles have the correct price fields set:
 * - priceAirportTransfer
 * - priceTrip
 * - price6Hours
 * - price12Hours
 * 
 * Usage:
 *   node scripts/check-and-fix-vehicle-prices.js [--fix]
 * 
 * Options:
 *   --fix    Automatically fix missing prices
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default pricing structure
const DEFAULT_PRICES = {
  'alphard': {
    priceAirportTransfer: 80,
    priceTrip: 75,
    price6Hours: 360,
    price12Hours: 720
  },
  'noah': {
    priceAirportTransfer: 75,
    priceTrip: 70,
    price6Hours: 360,
    price12Hours: 660
  },
  'combi': {
    priceAirportTransfer: 90,
    priceTrip: 85,
    price6Hours: 390,
    price12Hours: 720
  },
  'hiace': {
    priceAirportTransfer: 90,
    priceTrip: 85,
    price6Hours: 390,
    price12Hours: 720
  }
};

function getVehicleType(vehicleName) {
  const nameLower = vehicleName.toLowerCase();
  
  if (nameLower.includes('alphard')) return 'alphard';
  if (nameLower.includes('noah')) return 'noah';
  if (nameLower.includes('combi')) return 'combi';
  if (nameLower.includes('hiace')) return 'hiace';
  
  // Default to alphard pricing
  return 'alphard';
}

function getMissingPrices(vehicle) {
  const missing = [];
  
  if (!vehicle.priceAirportTransfer) missing.push('priceAirportTransfer');
  if (!vehicle.priceTrip) missing.push('priceTrip');
  if (!vehicle.price6Hours) missing.push('price6Hours');
  if (!vehicle.price12Hours) missing.push('price12Hours');
  
  return missing;
}

async function checkVehiclePrices() {
  console.log('🔍 Checking vehicle prices...\n');
  
  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      name: true,
      model: true,
      priceAirportTransfer: true,
      priceTrip: true,
      price6Hours: true,
      price12Hours: true,
      price: true, // Legacy field
      status: true
    }
  });
  
  console.log(`Found ${vehicles.length} vehicles\n`);
  
  let issuesFound = 0;
  const fixes = [];
  
  for (const vehicle of vehicles) {
    const missing = getMissingPrices(vehicle);
    
    if (missing.length > 0) {
      issuesFound++;
      console.log(`❌ ${vehicle.name} (${vehicle.status})`);
      console.log(`   Missing: ${missing.join(', ')}`);
      
      const vehicleType = getVehicleType(vehicle.name);
      const defaultPrices = DEFAULT_PRICES[vehicleType];
      
      console.log(`   Suggested fixes (${vehicleType} pricing):`);
      
      const updateData = {};
      for (const field of missing) {
        const suggestedPrice = defaultPrices[field];
        console.log(`   - ${field}: $${suggestedPrice}`);
        updateData[field] = suggestedPrice;
      }
      
      fixes.push({
        id: vehicle.id,
        name: vehicle.name,
        updateData
      });
      
      console.log('');
    } else {
      console.log(`✅ ${vehicle.name} (${vehicle.status})`);
      console.log(`   Airport Transfer: $${vehicle.priceAirportTransfer}`);
      console.log(`   Trip: $${vehicle.priceTrip}`);
      console.log(`   6 Hours: $${vehicle.price6Hours}`);
      console.log(`   12 Hours: $${vehicle.price12Hours}`);
      console.log('');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${issuesFound} vehicle(s) with missing prices`);
  console.log('='.repeat(60) + '\n');
  
  return { vehicles, fixes, issuesFound };
}

async function fixVehiclePrices(fixes) {
  console.log('🔧 Fixing vehicle prices...\n');
  
  let fixed = 0;
  let failed = 0;
  
  for (const fix of fixes) {
    try {
      await prisma.vehicle.update({
        where: { id: fix.id },
        data: fix.updateData
      });
      
      console.log(`✅ Fixed: ${fix.name}`);
      Object.entries(fix.updateData).forEach(([field, value]) => {
        console.log(`   - ${field}: $${value}`);
      });
      console.log('');
      
      fixed++;
    } catch (error) {
      console.error(`❌ Failed to fix ${fix.name}:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Fixed: ${fixed} | Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  const shouldFix = process.argv.includes('--fix');
  
  try {
    const { vehicles, fixes, issuesFound } = await checkVehiclePrices();
    
    if (issuesFound === 0) {
      console.log('🎉 All vehicles have correct prices!\n');
      return;
    }
    
    if (shouldFix) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(`\n⚠️  About to update ${fixes.length} vehicle(s). Continue? (y/n): `, async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await fixVehiclePrices(fixes);
          console.log('✅ Done!\n');
        } else {
          console.log('❌ Cancelled\n');
        }
        
        rl.close();
        await prisma.$disconnect();
      });
    } else {
      console.log('💡 Tip: Run with --fix flag to automatically update prices:');
      console.log('   node scripts/check-and-fix-vehicle-prices.js --fix\n');
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkVehiclePrices, fixVehiclePrices };
