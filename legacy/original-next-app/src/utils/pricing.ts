/**
 * Calculate booking price based on ZBK price list
 * 
 * Updated Pricing Logic:
 * - Airport Transfer One Way:
 *   - Airport → Home/Hotel/Destination: priceAirportTransfer (harga lama)
 *   - Home/Hotel/Destination → Airport: priceAirportTransfer - SGD 10
 * - Rental:
 *   - 6 hours: price6Hours
 *   - 12 hours: price12Hours
 *   - > 6 hours: price6Hours + (additional hours × pricePerHour)
 *   - > 12 hours: price12Hours + (additional hours × pricePerHour)
 * - Midnight Charge: +SGD 10 for pickup between 23:00 - 06:00 Singapore time
 * - No Tax: Tax calculation removed
 */

export interface PriceCalculationParams {
  vehicleName: string
  service: string // 'one-way' or 'round-trip' or 'rental'
  duration?: string | number // e.g., "6 hours" or 6 (only used for round-trip)
}

export interface VehiclePricing {
  priceAirportTransfer?: number | null
  pricePerHour?: number | null
  price6Hours?: number | null
  price12Hours?: number | null
}

export interface CalculatePriceParams {
  vehicle: VehiclePricing
  serviceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL'
  pickupLocation: string
  dropoffLocation?: string | null
  startTime?: string // Format: "HH:mm" (24-hour format)
  startDate?: string | Date // For date context
  hours?: number // For RENTAL service type
}

/**
 * Check if pickup time is in midnight hours (23:00 - 06:00 Singapore time)
 */
export function isMidnightPickup(startTime?: string, startDate?: string | Date): boolean {
  if (!startTime) return false
  
  try {
    // Parse time string (format: "HH:mm" or "HH:mm:ss")
    const [hoursStr] = startTime.split(':')
    const hour = parseInt(hoursStr, 10)
    
    // Check if hour is between 23:00 (23) and 06:00 (6)
    // This covers: 23, 0, 1, 2, 3, 4, 5, 6
    return hour >= 23 || hour < 7
  } catch (error) {
    console.error('Error parsing startTime:', error)
    return false
  }
}

/**
 * Check if location is airport-related
 */
export function isAirportLocation(location: string): boolean {
  const locationLower = location.toLowerCase()
  
  const airportKeywords = [
    'airport', 'terminal', 'bandara', 'arrival', 'departure', 
    'flight', 'gate', 'changi', 'soekarno', 'hatta'
  ]
  
  const airportNames = [
    'changi', 'suvarnabhumi', 'don mueang', 'noi bai', 'tan son nhat',
    'ninoy aquino', 'soekarno-hatta', 'ngurah rai', 'kuala lumpur',
    'klia', 'penang', 'phuket', 'incheon', 'narita', 'haneda',
    'singapore changi', 'hong kong', 'macau', 'dubai', 'heathrow',
    'ngurah rai', 'denpasar', 'dps', 'singapore airport', 'sin',
    'soekarno hatta', 'soetta', 'cengkareng', 'cgk',
    'juanda', 'sub', 'halim', 'lombok airport', 'praya', 'lop',
    'hkg', 'hkt'
  ]
  
  return airportKeywords.some(kw => locationLower.includes(kw)) || 
         airportNames.some(name => locationLower.includes(name))
}

/**
 * Calculate booking price with new pricing logic
 */
export function calculateBookingPriceNew(params: CalculatePriceParams): {
  subtotal: number
  midnightCharge: number
  total: number
  breakdown: {
    basePrice: number
    additionalHours?: number
    additionalHoursPrice?: number
    midnightCharge: number
  }
} {
  const {
    vehicle,
    serviceType,
    pickupLocation,
    dropoffLocation,
    startTime,
    hours = 0
  } = params

  let basePrice = 0
  let additionalHours = 0
  let additionalHoursPrice = 0
  const midnightCharge = isMidnightPickup(startTime) ? 10 : 0

  // Calculate base price based on service type
  if (serviceType === 'AIRPORT_TRANSFER') {
    const pickupIsAirport = isAirportLocation(pickupLocation)
    const dropoffIsAirport = dropoffLocation ? isAirportLocation(dropoffLocation) : false
    
    // Get base airport transfer price
    const airportTransferPrice = vehicle.priceAirportTransfer || 100
    
    if (pickupIsAirport && !dropoffIsAirport) {
      // Airport → Home/Hotel/Destination: Use original price
      basePrice = airportTransferPrice
    } else if (!pickupIsAirport && dropoffIsAirport) {
      // Home/Hotel/Destination → Airport: Reduce SGD 10
      basePrice = Math.max(0, airportTransferPrice - 10)
    } else {
      // Default: Use original price (fallback)
      basePrice = airportTransferPrice
    }
  } else if (serviceType === 'TRIP') {
    // Trip (one-way) uses priceAirportTransfer, same as airport transfer
    basePrice = vehicle.priceAirportTransfer || 100
  } else {
    // RENTAL: Calculate based on hours
    const price6Hours = vehicle.price6Hours || 360
    const price12Hours = vehicle.price12Hours || 720
    const pricePerHour = vehicle.pricePerHour || 60
    
    if (hours <= 6) {
      basePrice = price6Hours
    } else if (hours <= 12) {
      // > 6 hours but <= 12 hours: 6 hours package + additional hours
      basePrice = price6Hours
      additionalHours = hours - 6
      additionalHoursPrice = additionalHours * pricePerHour
    } else {
      // > 12 hours: 12 hours package + additional hours
      basePrice = price12Hours
      additionalHours = hours - 12
      additionalHoursPrice = additionalHours * pricePerHour
    }
  }

  const subtotal = basePrice + additionalHoursPrice
  const total = subtotal + midnightCharge

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
  }
}

/**
 * Calculate total booking price (legacy function - kept for backward compatibility)
 */
export function calculateBookingPrice(params: PriceCalculationParams): number {
  const { vehicleName, service, duration } = params
  
  // Normalize service type
  const serviceUpper = service.toUpperCase()
  const isOneWay = serviceUpper.includes('ONE') || 
                   serviceUpper.includes('ONE-WAY') || 
                   serviceUpper.includes('ONEWAY') ||
                   serviceUpper.includes('AIRPORT') || 
                   serviceUpper.includes('TRANSFER')
  
  // Normalize vehicle name for matching
  const vehicleNameUpper = vehicleName.toUpperCase()
  
  // ONE WAY: Flat rate per trip (no hours calculation)
  if (isOneWay) {
    if (vehicleNameUpper.includes('ALPHARD')) {
      return 80
    } else if (vehicleNameUpper.includes('NOAH')) {
      return 75
    } else if (vehicleNameUpper.includes('COMBI')) {
      return 90
    } else {
      return 80 // Default one-way price
    }
  }
  
  // ROUND TRIP: Calculate based on hours
  // Extract hours from duration
  let hours = 0
  if (duration) {
    if (typeof duration === 'string') {
      // Extract number from string like "6 hours" or "12 hours"
      const match = duration.match(/\d+/)
      hours = match ? parseInt(match[0]) : 6 // Default 6 hours if not specified
    } else {
      hours = duration
    }
  } else {
    hours = 6 // Default to 6 hours for round trip
  }
  
  // Alphard round trip pricing
  if (vehicleNameUpper.includes('ALPHARD')) {
    if (hours >= 12) {
      return 720
    } else if (hours >= 6) {
      return 360
    } else {
      // For less than 6 hours, use 6-hour rate
      return 360
    }
  }
  
  // Noah round trip pricing
  if (vehicleNameUpper.includes('NOAH')) {
    if (hours >= 12) {
      return 660
    } else if (hours >= 6) {
      return 360
    } else {
      return 360
    }
  }
  
  // Combi round trip pricing
  if (vehicleNameUpper.includes('COMBI')) {
    if (hours >= 12) {
      return 720
    } else if (hours >= 6) {
      return 390
    } else {
      return 390
    }
  }
  
  // Default pricing for other vehicles (round trip)
  if (hours >= 12) {
    return 720
  } else {
    return 360
  }
}

/**
 * Calculate 20% deposit amount
 */
export function calculateDeposit(totalAmount: number): number {
  return totalAmount * 0.2
}
