export interface Vehicle {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  year: number;
  rating: number;
  isLuxury: boolean;
  features?: string[];
  specialNote?: string;
  brand?: string;
  model?: string;
  engine?: string;
  fuel?: string;
  doors?: number;
  carouselOrder?: number;
}

// Real fleet data - Toyota vehicles
export const vehicles: Vehicle[] = [
  {
    id: '1',
    name: 'TOYOTA ALPHARD',
    image: '/4.-alphard-colors-black.png',
    price: 240,
    category: 'Wedding Affairs',
    seats: 7,
    transmission: 'Automatic',
    year: 2025,
    rating: 4.9,
    isLuxury: true,
    specialNote: 'Wedding Function - Minimum 5 hours',
    brand: 'TOYOTA',
    model: 'ALPHARD',
    features: ['Wedding Function', 'Minimum 5 hours', 'Premium Interior', 'Air Conditioning'],
  },
  {
    id: '2',
    name: 'TOYOTA ALPHARD / VELLFIRE',
    image: '/4.-alphard-colors-black.png',
    price: 320,
    category: 'Alphard',
    seats: 4,
    transmission: 'Automatic',
    year: 2025,
    rating: 4.8,
    isLuxury: true,
    brand: 'Toyota',
    model: 'ALPHARD / VELLFIRE',
    doors: 3,
    features: ['Premium Seating', '3 Doors', 'Luxury Interior', 'Climate Control'],
  },
  {
    id: '3',
    name: 'TOYOTA HIACE COMBI 13 SEATER',
    image: '/4.-alphard-colors-black.png',
    price: 360,
    category: 'COMBI',
    seats: 12,
    transmission: 'Automatic',
    year: 2025,
    rating: 4.7,
    isLuxury: false,
    brand: 'TOYOTA',
    model: 'HIACE',
    engine: '3000',
    fuel: 'Diesel',
    doors: 4,
    specialNote: '13 SEATER',
    features: ['13 Seater', '3000cc Engine', 'Diesel', '4 Doors'],
  },
];

// Vehicle categories for filtering
export const vehicleCategories = ['All', 'Wedding Affairs', 'Alphard', 'COMBI'];

// Helper function to get vehicle by ID
export const getVehicleById = (id: string): Vehicle | undefined => {
  return vehicles.find(vehicle => vehicle.id === id);
};

// Helper function to get vehicles by category
export const getVehiclesByCategory = (category: string): Vehicle[] => {
  if (category === 'All') return vehicles;
  return vehicles.filter(vehicle => vehicle.category === category);
};
