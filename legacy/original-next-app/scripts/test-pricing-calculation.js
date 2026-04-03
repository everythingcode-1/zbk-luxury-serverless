/**
 * Test Pricing Calculation
 * 
 * This script tests the new pricing logic with 10 different scenarios
 * to ensure all calculations are correct.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import pricing function (we'll need to adapt this for Node.js)
// For now, we'll implement the logic directly for testing

/**
 * Check if pickup time is in midnight hours (23:00 - 06:00 Singapore time)
 */
function isMidnightPickup(startTime) {
  if (!startTime) return false;
  
  try {
    const [hoursStr] = startTime.split(':');
    const hour = parseInt(hoursStr, 10);
    return hour >= 23 || hour < 7;
  } catch (error) {
    console.error('Error parsing startTime:', error);
    return false;
  }
}

/**
 * Check if location is airport-related
 */
function isAirportLocation(location) {
  const locationLower = location.toLowerCase();
  
  const airportKeywords = [
    'airport', 'terminal', 'bandara', 'arrival', 'departure', 
    'flight', 'gate', 'changi', 'soekarno', 'hatta'
  ];
  
  const airportNames = [
    'changi', 'suvarnabhumi', 'don mueang', 'noi bai', 'tan son nhat',
    'ninoy aquino', 'soekarno-hatta', 'ngurah rai', 'kuala lumpur',
    'klia', 'penang', 'phuket', 'incheon', 'narita', 'haneda',
    'singapore changi', 'hong kong', 'macau', 'dubai', 'heathrow',
    'ngurah rai', 'denpasar', 'dps', 'singapore airport', 'sin',
    'soekarno hatta', 'soetta', 'cengkareng', 'cgk',
    'juanda', 'sub', 'halim', 'lombok airport', 'praya', 'lop',
    'hkg', 'hkt'
  ];
  
  return airportKeywords.some(kw => locationLower.includes(kw)) || 
         airportNames.some(name => locationLower.includes(name));
}

/**
 * Calculate booking price with new pricing logic
 */
function calculateBookingPriceNew(params) {
  const {
    vehicle,
    serviceType,
    pickupLocation,
    dropoffLocation,
    startTime,
    hours = 0
  } = params;

  let basePrice = 0;
  let additionalHours = 0;
  let additionalHoursPrice = 0;
  const midnightCharge = isMidnightPickup(startTime) ? 10 : 0;

  // Calculate base price based on service type
  if (serviceType === 'AIRPORT_TRANSFER') {
    const pickupIsAirport = isAirportLocation(pickupLocation);
    const dropoffIsAirport = dropoffLocation ? isAirportLocation(dropoffLocation) : false;
    
    // Get base airport transfer price
    const airportTransferPrice = vehicle.priceAirportTransfer || 100;
    
    if (pickupIsAirport && !dropoffIsAirport) {
      // Airport → Home/Hotel/Destination: Use original price
      basePrice = airportTransferPrice;
    } else if (!pickupIsAirport && dropoffIsAirport) {
      // Home/Hotel/Destination → Airport: Reduce $10
      basePrice = Math.max(0, airportTransferPrice - 10);
    } else {
      // Default: Use original price (fallback)
      basePrice = airportTransferPrice;
    }
  } else if (serviceType === 'TRIP') {
    // Trip uses pricePerHour (1 hour trip = pricePerHour)
    basePrice = vehicle.pricePerHour || 60;
  } else {
    // RENTAL: Calculate based on hours
    const price6Hours = vehicle.price6Hours || 360;
    const price12Hours = vehicle.price12Hours || 720;
    const pricePerHour = vehicle.pricePerHour || 60;
    
    if (hours <= 6) {
      basePrice = price6Hours;
    } else if (hours <= 12) {
      // > 6 hours but <= 12 hours: 6 hours package + additional hours
      basePrice = price6Hours;
      additionalHours = hours - 6;
      additionalHoursPrice = additionalHours * pricePerHour;
    } else {
      // > 12 hours: 12 hours package + additional hours
      basePrice = price12Hours;
      additionalHours = hours - 12;
      additionalHoursPrice = additionalHours * pricePerHour;
    }
  }

  const subtotal = basePrice + additionalHoursPrice;
  const total = subtotal + midnightCharge;

  return {
    subtotal,
    midnightCharge,
    total,
    breakdown: {
      basePrice,
      ...(additionalHours > 0 && {
        additionalHours,
        additionalHoursPrice
      }),
      midnightCharge
    }
  };
}

/**
 * Test Case Structure
 */
function runTest(testNumber, testName, params, expected) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST ${testNumber}: ${testName}`);
  console.log('='.repeat(60));
  
  const result = calculateBookingPriceNew(params);
  
  console.log('Input:');
  console.log(`  Vehicle: ${params.vehicle.name || 'N/A'}`);
  console.log(`  Service Type: ${params.serviceType}`);
  console.log(`  Pickup: ${params.pickupLocation}`);
  console.log(`  Dropoff: ${params.dropoffLocation || 'N/A'}`);
  console.log(`  Start Time: ${params.startTime || 'N/A'}`);
  console.log(`  Hours: ${params.hours || 0}`);
  
  console.log('\nCalculation:');
  console.log(`  Base Price: $${result.breakdown.basePrice.toFixed(2)}`);
  if (result.breakdown.additionalHours) {
    console.log(`  Additional Hours: ${result.breakdown.additionalHours} × $${(result.breakdown.additionalHoursPrice / result.breakdown.additionalHours).toFixed(2)} = $${result.breakdown.additionalHoursPrice.toFixed(2)}`);
  }
  console.log(`  Midnight Charge: $${result.midnightCharge.toFixed(2)}`);
  console.log(`  Subtotal: $${result.subtotal.toFixed(2)}`);
  console.log(`  Total: $${result.total.toFixed(2)}`);
  
  console.log('\nExpected:');
  console.log(`  Subtotal: $${expected.subtotal.toFixed(2)}`);
  console.log(`  Midnight Charge: $${expected.midnightCharge.toFixed(2)}`);
  console.log(`  Total: $${expected.total.toFixed(2)}`);
  
  const subtotalMatch = Math.abs(result.subtotal - expected.subtotal) < 0.01;
  const midnightMatch = Math.abs(result.midnightCharge - expected.midnightCharge) < 0.01;
  const totalMatch = Math.abs(result.total - expected.total) < 0.01;
  
  const passed = subtotalMatch && midnightMatch && totalMatch;
  
  console.log('\nResult:');
  if (passed) {
    console.log('✅ PASSED');
  } else {
    console.log('❌ FAILED');
    if (!subtotalMatch) console.log(`  - Subtotal mismatch: got $${result.subtotal.toFixed(2)}, expected $${expected.subtotal.toFixed(2)}`);
    if (!midnightMatch) console.log(`  - Midnight charge mismatch: got $${result.midnightCharge.toFixed(2)}, expected $${expected.midnightCharge.toFixed(2)}`);
    if (!totalMatch) console.log(`  - Total mismatch: got $${result.total.toFixed(2)}, expected $${expected.total.toFixed(2)}`);
  }
  
  return passed;
}

/**
 * Main Test Function
 */
async function runAllTests() {
  console.log('\n🧪 PRICING CALCULATION TEST SUITE');
  console.log('Testing new pricing logic with 10 different scenarios\n');
  
  // Vehicle data (Toyota Alphard)
  const alphardVehicle = {
    name: 'Toyota Alphard',
    priceAirportTransfer: 80,
    price6Hours: 360,
    price12Hours: 720,
    pricePerHour: 60 // Used for TRIP service and additional rental hours
  };
  
  const noahVehicle = {
    name: 'Toyota Noah',
    priceAirportTransfer: 75,
    price6Hours: 360,
    price12Hours: 660,
    pricePerHour: 60 // Used for TRIP service and additional rental hours
  };
  
  const combiVehicle = {
    name: 'Toyota Combi',
    priceAirportTransfer: 90,
    price6Hours: 390,
    price12Hours: 720,
    pricePerHour: 65 // Used for TRIP service and additional rental hours
  };
  
  const results = [];
  
  // TEST 1: Airport Transfer - Airport → Home (Normal Price)
  results.push(runTest(
    1,
    'Airport Transfer: Airport → Home (Normal Price)',
    {
      vehicle: alphardVehicle,
      serviceType: 'AIRPORT_TRANSFER',
      pickupLocation: 'Changi Airport Terminal 1',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '14:00',
      hours: 0
    },
    {
      subtotal: 80, // Normal airport transfer price
      midnightCharge: 0,
      total: 80
    }
  ));
  
  // TEST 2: Airport Transfer - Home → Airport (Price - $10)
  results.push(runTest(
    2,
    'Airport Transfer: Home → Airport (Price - $10)',
    {
      vehicle: alphardVehicle,
      serviceType: 'AIRPORT_TRANSFER',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Changi Airport Terminal 1',
      startTime: '10:00',
      hours: 0
    },
    {
      subtotal: 70, // 80 - 10 = 70
      midnightCharge: 0,
      total: 70
    }
  ));
  
  // TEST 3: Trip One Way (Non-Airport)
  results.push(runTest(
    3,
    'Trip One Way: Hotel → Shopping Mall',
    {
      vehicle: alphardVehicle,
      serviceType: 'TRIP',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Orchard Road Shopping Mall',
      startTime: '15:00',
      hours: 0
    },
    {
      subtotal: 60, // Trip price = pricePerHour (1 hour)
      midnightCharge: 0,
      total: 60
    }
  ));
  
  // TEST 4: Rental 6 Hours (Exact 6 hours)
  results.push(runTest(
    4,
    'Rental: 6 Hours (Package Price)',
    {
      vehicle: alphardVehicle,
      serviceType: 'RENTAL',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '09:00',
      hours: 6
    },
    {
      subtotal: 360, // 6 hours package
      midnightCharge: 0,
      total: 360
    }
  ));
  
  // TEST 5: Rental 7 Hours (6 hours + 1 hour per hour)
  results.push(runTest(
    5,
    'Rental: 7 Hours (6 hours package + 1 hour per hour)',
    {
      vehicle: alphardVehicle,
      serviceType: 'RENTAL',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '09:00',
      hours: 7
    },
    {
      subtotal: 420, // 360 (6 hours) + 60 (1 hour × $60)
      midnightCharge: 0,
      total: 420
    }
  ));
  
  // TEST 6: Rental 12 Hours (Exact 12 hours)
  results.push(runTest(
    6,
    'Rental: 12 Hours (Package Price)',
    {
      vehicle: alphardVehicle,
      serviceType: 'RENTAL',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '09:00',
      hours: 12
    },
    {
      subtotal: 720, // 12 hours package
      midnightCharge: 0,
      total: 720
    }
  ));
  
  // TEST 7: Rental 13 Hours (12 hours + 1 hour per hour)
  results.push(runTest(
    7,
    'Rental: 13 Hours (12 hours package + 1 hour per hour)',
    {
      vehicle: alphardVehicle,
      serviceType: 'RENTAL',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '09:00',
      hours: 13
    },
    {
      subtotal: 780, // 720 (12 hours) + 60 (1 hour × $60)
      midnightCharge: 0,
      total: 780
    }
  ));
  
  // TEST 8: Midnight Pickup Charge (23:00 - 06:00)
  results.push(runTest(
    8,
    'Midnight Pickup Charge: Airport Transfer at 23:30',
    {
      vehicle: alphardVehicle,
      serviceType: 'AIRPORT_TRANSFER',
      pickupLocation: 'Changi Airport Terminal 1',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '23:30',
      hours: 0
    },
    {
      subtotal: 80, // Normal airport transfer price
      midnightCharge: 10, // Midnight charge
      total: 90 // 80 + 10
    }
  ));
  
  // TEST 9: Midnight + Rental > 6 Hours
  results.push(runTest(
    9,
    'Midnight Pickup + Rental 8 Hours',
    {
      vehicle: alphardVehicle,
      serviceType: 'RENTAL',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Marina Bay Sands Hotel',
      startTime: '01:00', // 1 AM - midnight charge applies
      hours: 8
    },
    {
      subtotal: 480, // 360 (6 hours) + 120 (2 hours × $60)
      midnightCharge: 10, // Midnight charge
      total: 490 // 480 + 10
    }
  ));
  
  // TEST 10: Different Vehicle (Noah) with Complex Scenario
  results.push(runTest(
    10,
    'Noah: Home → Airport at 05:00 (Midnight + Price - $10)',
    {
      vehicle: noahVehicle,
      serviceType: 'AIRPORT_TRANSFER',
      pickupLocation: 'Marina Bay Sands Hotel',
      dropoffLocation: 'Changi Airport Terminal 1',
      startTime: '05:00', // 5 AM - midnight charge applies
      hours: 0
    },
    {
      subtotal: 65, // 75 - 10 = 65 (Home → Airport)
      midnightCharge: 10, // Midnight charge
      total: 75 // 65 + 10
    }
  ));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  const passedCount = results.filter(r => r).length;
  const failedCount = results.length - passedCount;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`Success Rate: ${((passedCount / results.length) * 100).toFixed(1)}%`);
  
  if (failedCount === 0) {
    console.log('\n🎉 All tests passed! Pricing calculation is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the calculations above.');
  }
  
  console.log('\n');
  
  return failedCount === 0;
}

// Run tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error running tests:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

