import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

interface TestResult {
  testName: string
  passed: boolean
  expected: number
  actual: number
  details?: string
}

const results: TestResult[] = []

// Helper function to calculate price
function calculatePrice(
  vehicle: any,
  serviceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL',
  hours?: number
): number {
  let subtotal = 0

  if (serviceType === 'AIRPORT_TRANSFER') {
    subtotal = vehicle.priceAirportTransfer || 0
  } else if (serviceType === 'TRIP') {
    subtotal = vehicle.priceTrip || 0
  } else if (serviceType === 'RENTAL') {
    const bookingHours = hours || 6
    if (bookingHours >= 12 && vehicle.price12Hours) {
      subtotal = vehicle.price12Hours
    } else if (bookingHours >= 6 && vehicle.price6Hours) {
      subtotal = vehicle.price6Hours
    } else {
      subtotal = vehicle.price6Hours || 0
    }
  }

  const tax = subtotal * 0.1 // 10% tax
  return subtotal + tax
}

// Test function
function test(
  testName: string,
  expected: number,
  actual: number,
  details?: string
) {
  const passed = Math.abs(expected - actual) < 0.01 // Allow small floating point differences
  results.push({ testName, passed, expected, actual, details })

  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`
  console.log(`${status} ${testName}`)
  console.log(`   Expected: $${expected.toFixed(2)}`)
  console.log(`   Actual:   $${actual.toFixed(2)}`)
  if (details) {
    console.log(`   Details:  ${details}`)
  }
  console.log('')
}

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.cyan}  ZBK LIMO - BOOKING PRICING TEST SCRIPT${colors.reset}`)
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`)

  try {
    // Fetch all vehicles
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { name: 'asc' }
    })

    if (vehicles.length === 0) {
      console.log(`${colors.red}❌ No vehicles found in database!${colors.reset}\n`)
      return
    }

    console.log(`${colors.blue}📊 Found ${vehicles.length} vehicles in database${colors.reset}\n`)

    // Display vehicles
    for (const vehicle of vehicles) {
      console.log(`${colors.magenta}━━━ ${vehicle.name} (${vehicle.model}) ━━━${colors.reset}`)
      console.log(`   Capacity: ${vehicle.capacity} pax, ${vehicle.luggage || 0} luggage`)
      console.log(`   Airport Transfer: $${vehicle.priceAirportTransfer?.toFixed(2) || 'N/A'}`)
      console.log(`   Trip:             $${vehicle.priceTrip?.toFixed(2) || 'N/A'}`)
      console.log(`   6 Hours Rental:   $${vehicle.price6Hours?.toFixed(2) || 'N/A'}`)
      console.log(`   12 Hours Rental:  $${vehicle.price12Hours?.toFixed(2) || 'N/A'}`)
      console.log('')
    }

    // Test each vehicle
    for (const vehicle of vehicles) {
      console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
      console.log(`${colors.yellow}Testing: ${vehicle.name}${colors.reset}`)
      console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

      // Test 1: Airport Transfer
      if (vehicle.priceAirportTransfer) {
        const subtotal = vehicle.priceAirportTransfer
        const tax = subtotal * 0.1
        const expected = subtotal + tax
        const actual = calculatePrice(vehicle, 'AIRPORT_TRANSFER')
        
        test(
          `${vehicle.name} - Airport Transfer`,
          expected,
          actual,
          `Base: $${subtotal.toFixed(2)} + Tax (10%): $${tax.toFixed(2)}`
        )
      }

      // Test 2: Trip
      if (vehicle.priceTrip) {
        const subtotal = vehicle.priceTrip
        const tax = subtotal * 0.1
        const expected = subtotal + tax
        const actual = calculatePrice(vehicle, 'TRIP')
        
        test(
          `${vehicle.name} - Trip`,
          expected,
          actual,
          `Base: $${subtotal.toFixed(2)} + Tax (10%): $${tax.toFixed(2)}`
        )
      }

      // Test 3: 6 Hours Rental
      if (vehicle.price6Hours) {
        const subtotal = vehicle.price6Hours
        const tax = subtotal * 0.1
        const expected = subtotal + tax
        const actual = calculatePrice(vehicle, 'RENTAL', 6)
        
        test(
          `${vehicle.name} - 6 Hours Rental`,
          expected,
          actual,
          `Base: $${subtotal.toFixed(2)} + Tax (10%): $${tax.toFixed(2)}`
        )
      }

      // Test 4: 12 Hours Rental
      if (vehicle.price12Hours) {
        const subtotal = vehicle.price12Hours
        const tax = subtotal * 0.1
        const expected = subtotal + tax
        const actual = calculatePrice(vehicle, 'RENTAL', 12)
        
        test(
          `${vehicle.name} - 12 Hours Rental`,
          expected,
          actual,
          `Base: $${subtotal.toFixed(2)} + Tax (10%): $${tax.toFixed(2)}`
        )
      }

      // Test 5: Edge case - 8 hours rental (should use 6 hours price)
      if (vehicle.price6Hours) {
        const subtotal = vehicle.price6Hours
        const tax = subtotal * 0.1
        const expected = subtotal + tax
        const actual = calculatePrice(vehicle, 'RENTAL', 8)
        
        test(
          `${vehicle.name} - 8 Hours Rental (uses 6hr price)`,
          expected,
          actual,
          `Base: $${subtotal.toFixed(2)} + Tax (10%): $${tax.toFixed(2)}`
        )
      }
    }

    // Summary
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`)
    console.log(`${colors.cyan}  TEST SUMMARY${colors.reset}`)
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`)

    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const failedTests = results.filter(r => !r.passed).length

    console.log(`Total Tests:  ${totalTests}`)
    console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`)
    if (failedTests > 0) {
      console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`)
    }
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`)

    if (failedTests > 0) {
      console.log(`${colors.red}━━━ Failed Tests ━━━${colors.reset}\n`)
      results.filter(r => !r.passed).forEach(result => {
        console.log(`${colors.red}✗ ${result.testName}${colors.reset}`)
        console.log(`  Expected: $${result.expected.toFixed(2)}`)
        console.log(`  Actual:   $${result.actual.toFixed(2)}`)
        console.log(`  Difference: $${Math.abs(result.expected - result.actual).toFixed(2)}\n`)
      })
    }

    // Create sample bookings for verification
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`)
    console.log(`${colors.cyan}  SAMPLE BOOKING SCENARIOS${colors.reset}`)
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`)

    for (const vehicle of vehicles) {
      console.log(`${colors.magenta}${vehicle.name}:${colors.reset}`)
      
      if (vehicle.priceAirportTransfer) {
        const total = calculatePrice(vehicle, 'AIRPORT_TRANSFER')
        console.log(`  ✈️  Airport Transfer (Changi → Hotel):     $${total.toFixed(2)}`)
      }
      
      if (vehicle.priceTrip) {
        const total = calculatePrice(vehicle, 'TRIP')
        console.log(`  🚗 Trip (Marina Bay → Sentosa):           $${total.toFixed(2)}`)
      }
      
      if (vehicle.price6Hours) {
        const total = calculatePrice(vehicle, 'RENTAL', 6)
        console.log(`  ⏰ 6 Hours Rental (City Tour):             $${total.toFixed(2)}`)
      }
      
      if (vehicle.price12Hours) {
        const total = calculatePrice(vehicle, 'RENTAL', 12)
        console.log(`  ⏰ 12 Hours Rental (Full Day):             $${total.toFixed(2)}`)
      }
      
      console.log('')
    }

    // Price comparison table
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`)
    console.log(`${colors.cyan}  PRICE COMPARISON TABLE${colors.reset}`)
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`)

    console.log('Service Type         | Alphard | Noah    | Combi')
    console.log('---------------------|---------|---------|--------')
    
    const alphard = vehicles.find(v => v.name.includes('ALPHARD'))
    const noah = vehicles.find(v => v.name.includes('NOAH'))
    const combi = vehicles.find(v => v.name.includes('COMBI'))

    if (alphard && noah && combi) {
      console.log(`Airport Transfer     | $${calculatePrice(alphard, 'AIRPORT_TRANSFER').toFixed(2).padStart(6)} | $${calculatePrice(noah, 'AIRPORT_TRANSFER').toFixed(2).padStart(6)} | $${calculatePrice(combi, 'AIRPORT_TRANSFER').toFixed(2).padStart(6)}`)
      console.log(`Trip                 | $${calculatePrice(alphard, 'TRIP').toFixed(2).padStart(6)} | $${calculatePrice(noah, 'TRIP').toFixed(2).padStart(6)} | $${calculatePrice(combi, 'TRIP').toFixed(2).padStart(6)}`)
      console.log(`6 Hours Rental       | $${calculatePrice(alphard, 'RENTAL', 6).toFixed(2).padStart(6)} | $${calculatePrice(noah, 'RENTAL', 6).toFixed(2).padStart(6)} | $${calculatePrice(combi, 'RENTAL', 6).toFixed(2).padStart(6)}`)
      console.log(`12 Hours Rental      | $${calculatePrice(alphard, 'RENTAL', 12).toFixed(2).padStart(6)} | $${calculatePrice(noah, 'RENTAL', 12).toFixed(2).padStart(6)} | $${calculatePrice(combi, 'RENTAL', 12).toFixed(2).padStart(6)}`)
    }

    console.log('')

    // Exit status
    if (failedTests === 0) {
      console.log(`${colors.green}✅ All tests passed! Pricing calculation is correct.${colors.reset}\n`)
      process.exit(0)
    } else {
      console.log(`${colors.red}❌ Some tests failed. Please review the pricing logic.${colors.reset}\n`)
      process.exit(1)
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error running tests:${colors.reset}`, error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
runTests()



















