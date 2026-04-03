// Vehicle data based on extracted information from images
// This will be used as fallback data when database is not available

export interface VehicleData {
  id: string
  name: string
  model: string
  year: number
  category: string
  status: string
  location: string
  plateNumber: string
  capacity: number
  color: string
  price: number // Hourly rental price in SGD
  minimumHours?: number // Minimum booking hours
  features: string[]
  images: string[]
  description: string
  rating?: number
  transmission?: string
  isLuxury?: boolean
}

export const vehicleData: VehicleData[] = [
  // Vehicle 1: Wedding Affairs - Toyota Alphard
  {
    id: '1',
    name: 'TOYOTA ALPHARD',
    model: 'ALPHARD',
    year: 2024,
    category: 'Wedding Affairs',
    status: 'AVAILABLE',
    location: 'Jakarta',
    plateNumber: 'B-1234-WED',
    capacity: 7,
    color: 'Black',
    price: 300.00, // SGD 300.00 per hour
    minimumHours: 5, // Minimum 5 hours as specified
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
      '/4.-alphard-colors-black.png', // Using existing image as placeholder
      '/vehicles/wedding-alphard-2.jpg',
      '/vehicles/wedding-alphard-3.jpg'
    ],
    description: 'Luxury Toyota Alphard specially prepared for wedding functions. Minimum 5 hours booking with professional chauffeur service. Perfect for bride and groom transportation with elegant interior and premium comfort.',
    rating: 4.9,
    transmission: 'Automatic',
    isLuxury: true
  },

  // Vehicle 2: Alphard/Vellfire Premium  
  {
    id: '2',
    name: 'TOYOTA ALPHARD / VELLFIRE',
    model: 'ALPHARD/VELLFIRE',
    year: 2024,
    category: 'Alphard',
    status: 'AVAILABLE',
    location: 'Jakarta',
    plateNumber: 'B-5678-LUX',
    capacity: 4, // 4 passengers as specified
    color: 'Pearl White',
    price: 140.00, // SGD 140.00 per hour as specified
    minimumHours: 3, // Reasonable minimum for this category
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
      '/4.-alphard-colors-black.png', // Using existing image as placeholder
      '/vehicles/alphard-vellfire-2.jpg',
      '/vehicles/alphard-vellfire-3.jpg'
    ],
    description: 'Premium Toyota Alphard/Vellfire with executive seating for 4 passengers. Perfect for business meetings, airport transfers, and luxury transportation. Features captain chairs and premium amenities for ultimate comfort.',
    rating: 4.8,
    transmission: 'Automatic',
    isLuxury: true
  },

  // Existing Vehicle 3: Toyota Hiace Combi (keeping existing data)
  {
    id: '3',
    name: 'TOYOTA HIACE COMBI 13 SEATER',
    model: 'HIACE',
    year: 2024,
    category: 'COMBI',
    status: 'AVAILABLE',
    location: 'Jakarta',
    plateNumber: 'B-9999-CMB',
    capacity: 12,
    color: 'White',
    price: 360.00, // Existing price
    minimumHours: 4,
    features: [
      'Large Group Transport',
      '13 Seater Capacity',
      'Air Conditioning',
      'Comfortable Seating',
      'Luggage Space',
      'Professional Driver'
    ],
    images: [
      '/4.-alphard-colors-black.png', // Using existing image as placeholder
      '/vehicles/hiace-2.jpg',
      '/vehicles/hiace-3.jpg'
    ],
    description: 'Spacious Toyota Hiace Combi perfect for group transportation. Ideal for family trips, corporate events, and group tours with comfortable seating for up to 12 passengers.',
    rating: 4.7,
    transmission: 'Automatic',
    isLuxury: false
  }
]

// Helper functions
export const getVehicleById = (id: string): VehicleData | undefined => {
  return vehicleData.find(vehicle => vehicle.id === id)
}

export const getVehiclesByCategory = (category: string): VehicleData[] => {
  return vehicleData.filter(vehicle => 
    vehicle.category.toLowerCase() === category.toLowerCase()
  )
}

export const getAvailableVehicles = (): VehicleData[] => {
  return vehicleData.filter(vehicle => vehicle.status === 'AVAILABLE')
}

export const getLuxuryVehicles = (): VehicleData[] => {
  return vehicleData.filter(vehicle => vehicle.isLuxury === true)
}

// Price calculation helper
export const calculatePrice = (vehicleId: string, hours: number): number => {
  const vehicle = getVehicleById(vehicleId)
  if (!vehicle) return 0
  
  const minimumHours = vehicle.minimumHours || 1
  const actualHours = Math.max(hours, minimumHours)
  
  return vehicle.price * actualHours
}
