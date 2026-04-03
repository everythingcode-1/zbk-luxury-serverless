/**
 * Airport Detection Utility
 * 
 * Centralized logic for detecting if a location is an airport
 * Used by: VehicleSelection, OrderSummary, Booking API, Stripe API
 */

// Generic airport keywords
const AIRPORT_KEYWORDS = [
  'airport',
  'terminal',
  'bandara',      // Indonesian
  'arrival',
  'departure',
  'flight',
  'gate'
];

// Specific airport names and IATA codes
const AIRPORT_NAMES = [
  // Bali, Indonesia
  'ngurah rai',
  'denpasar',
  'dps',
  
  // Singapore
  'changi',
  'singapore airport',
  'sin',
  
  // Jakarta, Indonesia
  'soekarno-hatta',
  'soekarno hatta',
  'soetta',
  'cengkareng',
  'cgk',
  
  // Surabaya, Indonesia
  'juanda',
  'surabaya airport',
  'sub',
  
  // Other Indonesia
  'halim',
  'halim perdanakusuma',
  'lombok airport',
  'praya',
  'lop',
  'yogyakarta airport',
  'adisucipto',
  'jog',
  
  // Malaysia
  'kuala lumpur airport',
  'klia',
  'kul',
  'penang airport',
  'pen',
  
  // Thailand
  'bangkok airport',
  'suvarnabhumi',
  'bkk',
  'don mueang',
  'dmk',
  'phuket airport',
  'hkt',
  'chiang mai airport',
  'cnx',
  
  // Hong Kong
  'hong kong airport',
  'hkg',
  'chek lap kok',
  
  // Philippines
  'manila airport',
  'ninoy aquino',
  'naia',
  'mnl',
  
  // Vietnam
  'ho chi minh airport',
  'tan son nhat',
  'sgn',
  'hanoi airport',
  'noi bai',
  'han',
  
  // Australia
  'sydney airport',
  'syd',
  'melbourne airport',
  'mel',
  'brisbane airport',
  'bne',
  'perth airport',
  'per',
  
  // Common airport terminal references
  'terminal 1',
  'terminal 2',
  'terminal 3',
  'terminal 4',
  'international terminal',
  'domestic terminal',
  't1', 't2', 't3', 't4'
];

/**
 * Check if a location string contains airport keywords or names
 * @param location - Location string to check (case-insensitive)
 * @returns true if location is detected as an airport
 */
export function isAirportLocation(location: string): boolean {
  if (!location) return false;
  
  const locationLower = location.toLowerCase().trim();
  
  // Check generic keywords
  for (const keyword of AIRPORT_KEYWORDS) {
    if (locationLower.includes(keyword)) {
      return true;
    }
  }
  
  // Check specific airport names
  for (const airportName of AIRPORT_NAMES) {
    if (locationLower.includes(airportName)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if either pickup or dropoff location is an airport
 * @param pickupLocation - Pickup location string
 * @param dropoffLocation - Drop-off location string
 * @returns true if either location is detected as an airport
 */
export function hasAirportInTrip(pickupLocation: string, dropoffLocation: string): boolean {
  return isAirportLocation(pickupLocation) || isAirportLocation(dropoffLocation);
}

/**
 * Get all supported airport keywords (for documentation/testing)
 */
export function getAirportKeywords(): string[] {
  return [...AIRPORT_KEYWORDS];
}

/**
 * Get all supported airport names (for documentation/testing)
 */
export function getAirportNames(): string[] {
  return [...AIRPORT_NAMES];
}

/**
 * Add custom airport name/keyword to detection
 * Useful for adding new airports without modifying this file
 * @param keyword - Airport name or keyword to add
 */
let customAirportKeywords: string[] = [];

export function addCustomAirportKeyword(keyword: string): void {
  const keywordLower = keyword.toLowerCase().trim();
  if (keywordLower && !customAirportKeywords.includes(keywordLower)) {
    customAirportKeywords.push(keywordLower);
  }
}

/**
 * Check if location matches custom keywords
 */
export function matchesCustomKeywords(location: string): boolean {
  if (!location || customAirportKeywords.length === 0) return false;
  
  const locationLower = location.toLowerCase().trim();
  return customAirportKeywords.some(keyword => locationLower.includes(keyword));
}

/**
 * Enhanced airport detection including custom keywords
 */
export function isAirportLocationEnhanced(location: string): boolean {
  return isAirportLocation(location) || matchesCustomKeywords(location);
}

/**
 * Get detected airport info from location string (for debugging)
 */
export function getAirportInfo(location: string): {
  isAirport: boolean;
  matchedKeyword?: string;
  matchedAirportName?: string;
} {
  if (!location) return { isAirport: false };
  
  const locationLower = location.toLowerCase().trim();
  
  // Check keywords first
  for (const keyword of AIRPORT_KEYWORDS) {
    if (locationLower.includes(keyword)) {
      return {
        isAirport: true,
        matchedKeyword: keyword
      };
    }
  }
  
  // Check airport names
  for (const airportName of AIRPORT_NAMES) {
    if (locationLower.includes(airportName)) {
      return {
        isAirport: true,
        matchedAirportName: airportName
      };
    }
  }
  
  // Check custom keywords
  for (const keyword of customAirportKeywords) {
    if (locationLower.includes(keyword)) {
      return {
        isAirport: true,
        matchedKeyword: `${keyword} (custom)`
      };
    }
  }
  
  return { isAirport: false };
}


















