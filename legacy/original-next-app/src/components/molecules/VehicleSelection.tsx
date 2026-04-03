'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { getImagePath } from '@/utils/imagePath';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { BookingData } from '@/components/organisms/BookingForm';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  status: string;
  location: string;
  plateNumber: string;
  capacity: number;
  luggage?: number;
  color: string;
  features: string[];
  images: string[];
  description?: string;
  price?: number; // Legacy hourly rental price
  priceAirportTransfer?: number;
  pricePerHour?: number;
  price6Hours?: number;
  price12Hours?: number;
  services?: string[];
  carouselOrder?: number;
  purchasePrice?: number;
}

export interface VehicleSelectionProps {
  className?: string;
  initialVehicleId?: string;
  bookingData?: BookingData; // Pass booking data to determine service type
  onComplete: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

// Airport detection keywords and names
const AIRPORT_KEYWORDS = ['airport', 'terminal', 'bandara', 'changi', 'soekarno', 'hatta'];
const AIRPORT_NAMES = [
  'changi', 'suvarnabhumi', 'don mueang', 'noi bai', 'tan son nhat',
  'ninoy aquino', 'soekarno-hatta', 'ngurah rai', 'kuala lumpur',
  'klia', 'penang', 'phuket', 'incheon', 'narita', 'haneda',
  'singapore changi', 'hong kong', 'macau', 'dubai', 'heathrow'
];

const checkLocation = (location: string): boolean => {
  if (!location) return false;
  const lowerLocation = location.toLowerCase();
  
  // Check keywords
  if (AIRPORT_KEYWORDS.some(keyword => lowerLocation.includes(keyword))) {
    return true;
  }
  
  // Check airport names
  if (AIRPORT_NAMES.some(name => lowerLocation.includes(name))) {
    return true;
  }
  
  return false;
};

const VehicleSelection: React.FC<VehicleSelectionProps> = (props) => {
  const {
    className,
    initialVehicleId,
    bookingData,
    onComplete,
    onBack,
  } = props;

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || '');
  const [filter, setFilter] = useState<string>('All');

  // Check trip type
  const isOneWay = bookingData?.tripType === 'one-way';
  
  // Auto-detect if this is an airport trip based on locations
  const isAirportTrip = useMemo(() => {
    if (!bookingData) return false;
    const pickup = bookingData.pickupLocation || '';
    const dropoff = bookingData.dropOffLocation || '';
    return checkLocation(pickup) || checkLocation(dropoff);
  }, [bookingData]);
  
  // Determine service type based on trip type and airport detection
  const autoServiceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL' = useMemo(() => {
    if (!isOneWay) return 'RENTAL';
    return isAirportTrip ? 'AIRPORT_TRANSFER' : 'TRIP';
  }, [isOneWay, isAirportTrip]);

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter only available vehicles for booking
        const availableVehicles = result.data.filter((v: Vehicle) => v.status === 'AVAILABLE')
        setVehicles(availableVehicles)
      } else {
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // Filter by capacity
  const capacityOptions = ['All', '6 Pax', '9 Pax']
  
  const filteredVehicles = filter === 'All' 
    ? vehicles 
    : filter === '6 Pax'
      ? vehicles.filter(vehicle => vehicle.capacity <= 6)
      : filter === '9 Pax'
        ? vehicles.filter(vehicle => vehicle.capacity >= 9)
        : vehicles;

  const vehicleCount = filteredVehicles.length;

  // Determine grid layout based on vehicle count
  const getGridClass = () => {
    if (vehicleCount === 4) {
      return "lg:grid-cols-2"; // 4 vehicles: 2x2 grid
    } else if (vehicleCount === 5) {
      return "lg:grid-cols-3"; // 5 vehicles: 3 on top, 2 on bottom
    } else if (vehicleCount === 2) {
      return "lg:grid-cols-2"; // 2 vehicles: 2x1 grid
    } else {
      return "lg:grid-cols-3"; // Default: 3 columns
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleContinue = () => {
    if (selectedVehicleId) {
      onComplete({ 
        selectedVehicleId,
        serviceType: autoServiceType
      });
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      <div className="mb-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Vehicle</h3>
        <p className="text-gray-600">
          {isOneWay 
            ? (isAirportTrip 
                ? 'Airport Transfer Service - To/From Airport' 
                : 'Trip Service - City to City')
            : 'Hourly Rental Packages'}
        </p>
      </div>

      {/* Capacity Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {capacityOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
              filter === option
                ? 'bg-luxury-gold text-gray-900 shadow-md'
                : 'bg-white text-gray-700 hover:bg-luxury-gold/10 hover:text-luxury-gold border border-gray-200 hover:border-luxury-gold/50'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      {vehicleCount === 5 ? (
        // Special layout for 5 vehicles: 3 on top, 2 on bottom (centered)
        <div className="mb-8">
          {/* Top row: 3 vehicles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredVehicles.slice(0, 3).map((vehicle) => (
              <VehicleCardContent 
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                isOneWay={isOneWay}
                isAirportTrip={isAirportTrip}
                bookingData={bookingData}
                onSelect={handleVehicleSelect}
              />
            ))}
          </div>
          {/* Bottom row: 2 vehicles (centered) */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[calc(66.666%+1.5rem)] lg:max-w-[calc(66.666%+1.5rem)]">
              {filteredVehicles.slice(3, 5).map((vehicle) => (
                <VehicleCardContent 
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicleId === vehicle.id}
                  isOneWay={isOneWay}
                  isAirportTrip={isAirportTrip}
                  bookingData={bookingData}
                  onSelect={handleVehicleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Standard grid layout for other vehicle counts
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", getGridClass())}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCardContent 
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleId === vehicle.id}
              isOneWay={isOneWay}
              isAirportTrip={isAirportTrip}
              bookingData={bookingData}
              onSelect={handleVehicleSelect}
            />
          ))}
        </div>
      )}

      {/* Action Buttons - Responsive dan rapi untuk mobile */}
      <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t-2 border-luxury-gold/20">
        {/* Mobile: Stacked vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="large"
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all order-2 sm:order-1 font-semibold"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </Button>
          
          <Button
            variant="primary"
            size="large"
            onClick={handleContinue}
            disabled={!selectedVehicleId}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-lg shadow-lg transition-all order-1 sm:order-2",
              selectedVehicleId 
                ? "bg-luxury-gold hover:bg-luxury-gold/90 text-gray-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
            )}
          >
            {selectedVehicleId ? (
              <>
                <span className="hidden md:inline">Continue to Order Summary</span>
                <span className="hidden sm:inline md:hidden">Continue</span>
                <span className="sm:hidden">Continue</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Select Vehicle First</span>
                <span className="sm:hidden">Select Vehicle</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </>
            )}
          </Button>
        </div>
        
        {!selectedVehicleId && (
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 font-medium">
            ⚠️ Please select a vehicle to continue
          </p>
        )}
      </div>
    </div>
  );
};

// Extract vehicle card content into a separate component to reduce duplication
interface VehicleCardContentProps {
  vehicle: Vehicle;
  isSelected: boolean;
  isOneWay: boolean;
  isAirportTrip: boolean;
  bookingData?: BookingData;
  onSelect: (id: string) => void;
}

const VehicleCardContent: React.FC<VehicleCardContentProps> = ({ 
  vehicle, 
  isSelected, 
  isOneWay, 
  isAirportTrip,
  bookingData,
  onSelect 
}) => {
  return (
    <div
      key={vehicle.id}
      className={cn(
        'bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg',
        'hover:shadow-2xl hover:-translate-y-1 border border-gray-200',
        isSelected
          ? 'ring-2 ring-luxury-gold shadow-xl border-luxury-gold'
          : 'hover:border-luxury-gold/50'
      )}
      onClick={() => onSelect(vehicle.id)}
    >
      {/* Vehicle Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={getImagePath(vehicle.images?.[0])} 
          alt={vehicle.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('/api/uploads/')) {
              target.src = vehicle.images?.[0] || '/4.-alphard-colors-black.png';
            }
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Premium Badge */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-luxury-gold/90 backdrop-blur-sm text-gray-900 border border-luxury-gold">
            Premium
          </div>
        </div>
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-luxury-gold/10 flex items-center justify-center">
            <div className="w-14 h-14 bg-luxury-gold rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="p-5 bg-white">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900">{vehicle.name}</h4>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">4.8</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {vehicle.capacity} pax
          </span>
          {vehicle.luggage && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {vehicle.luggage} luggage
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {vehicle.year}
          </span>
          <span className="px-2 py-1 bg-luxury-gold/10 text-luxury-gold rounded-full text-xs font-medium">
            {vehicle.capacity} Pax
          </span>
        </div>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {vehicle.features.slice(0, 3).map((feature) => (
              <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                +{vehicle.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        {isOneWay ? (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {isAirportTrip ? 'Airport Transfer' : 'Trip Service'}
                </div>
                <div className="text-xs text-gray-600">
                  {isAirportTrip ? 'To/from airport' : 'City to city'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  SGD {isAirportTrip 
                    ? (vehicle.priceAirportTransfer || 80)
                    : (vehicle.pricePerHour || 75)}
                </div>
                <div className="text-xs text-gray-600">/trip</div>
              </div>
            </div>
            <Button
              variant={isSelected ? 'primary' : 'secondary'}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(vehicle.id);
              }}
              className={cn(
                "w-full",
                isSelected ? 'bg-luxury-gold hover:bg-luxury-gold/90' : ''
              )}
            >
              {isSelected ? 'Selected' : 'Select Vehicle'}
            </Button>
          </div>
        ) : (
          /* Rental Pricing for Round Trip */
          <div className="space-y-2 pt-4 border-t border-gray-200">
            {(() => {
              const hours = parseInt(bookingData?.hours || '0');
              let displayPrice = 0;
              let priceLabel = '';
              
              if (hours <= 6) {
                displayPrice = vehicle.price6Hours || 360;
                priceLabel = `${hours} Hours`;
              } else if (hours <= 12) {
                displayPrice = vehicle.price12Hours || 720;
                priceLabel = `${hours} Hours`;
              } else {
                // For > 12 hours, calculate hourly rate based on 12-hour price
                const hourlyRate = (vehicle.price12Hours || 720) / 12;
                displayPrice = Math.round(hourlyRate * hours);
                priceLabel = `${hours} Hours (Custom)`;
              }
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{priceLabel}</div>
                      <div className="text-xs text-gray-600">
                        {hours <= 6 ? '6-hour package' : hours <= 12 ? '12-hour package' : 'Extended rental'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">SGD {displayPrice}</div>
                      <div className="text-xs text-gray-600">/rental</div>
                    </div>
                  </div>
                  {hours > 0 && (
                    <div className="text-xs text-gray-500 italic mt-2">
                      Duration: {hours} hour{hours > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              );
            })()}
            <Button
              variant={isSelected ? 'primary' : 'secondary'}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(vehicle.id);
              }}
              className={cn(
                "w-full mt-2",
                isSelected ? 'bg-luxury-gold hover:bg-luxury-gold/90' : ''
              )}
            >
              {isSelected ? 'Selected' : 'Select Vehicle'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const VehicleSelectionWrapper: React.FC<VehicleSelectionProps> = (props) => {
  const {
    className,
    initialVehicleId,
    bookingData,
    onComplete,
    onBack,
  } = props;

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || '');
  const [filter, setFilter] = useState<string>('All');

  // Check trip type
  const isOneWay = bookingData?.tripType === 'one-way';
  
  // Auto-detect if this is an airport trip based on locations
  const isAirportTrip = useMemo(() => {
    if (!bookingData) return false;
    const pickup = bookingData.pickupLocation || '';
    const dropoff = bookingData.dropOffLocation || '';
    return checkLocation(pickup) || checkLocation(dropoff);
  }, [bookingData]);
  
  // Determine service type based on trip type and airport detection
  const autoServiceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL' = useMemo(() => {
    if (!isOneWay) return 'RENTAL';
    return isAirportTrip ? 'AIRPORT_TRANSFER' : 'TRIP';
  }, [isOneWay, isAirportTrip]);

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter only available vehicles for booking
        const availableVehicles = result.data.filter((v: Vehicle) => v.status === 'AVAILABLE')
        setVehicles(availableVehicles)
      } else {
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // Filter by capacity
  const capacityOptions = ['All', '6 Pax', '9 Pax']
  
  const filteredVehicles = filter === 'All' 
    ? vehicles 
    : filter === '6 Pax'
      ? vehicles.filter(vehicle => vehicle.capacity <= 6)
      : filter === '9 Pax'
        ? vehicles.filter(vehicle => vehicle.capacity >= 9)
        : vehicles;

  const vehicleCount = filteredVehicles.length;

  // Determine grid layout based on vehicle count
  const getGridClass = () => {
    if (vehicleCount === 4) {
      return "lg:grid-cols-2"; // 4 vehicles: 2x2 grid
    } else if (vehicleCount === 5) {
      return "lg:grid-cols-3"; // 5 vehicles: 3 on top, 2 on bottom
    } else if (vehicleCount === 2) {
      return "lg:grid-cols-2"; // 2 vehicles: 2x1 grid
    } else {
      return "lg:grid-cols-3"; // Default: 3 columns
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleContinue = () => {
    if (selectedVehicleId) {
      onComplete({ 
        selectedVehicleId,
        serviceType: autoServiceType
      });
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      <div className="mb-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Vehicle</h3>
        <p className="text-gray-600">
          {isOneWay 
            ? (isAirportTrip 
                ? 'Airport Transfer Service - To/From Airport' 
                : 'Trip Service - City to City')
            : 'Hourly Rental Packages'}
        </p>
      </div>

      {/* Capacity Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {capacityOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
              filter === option
                ? 'bg-luxury-gold text-gray-900 shadow-md'
                : 'bg-white text-gray-700 hover:bg-luxury-gold/10 hover:text-luxury-gold border border-gray-200 hover:border-luxury-gold/50'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      {vehicleCount === 5 ? (
        // Special layout for 5 vehicles: 3 on top, 2 on bottom (centered)
        <div className="mb-8">
          {/* Top row: 3 vehicles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredVehicles.slice(0, 3).map((vehicle) => (
              <VehicleCardContent 
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                isOneWay={isOneWay}
                isAirportTrip={isAirportTrip}
                bookingData={bookingData}
                onSelect={handleVehicleSelect}
              />
            ))}
          </div>
          {/* Bottom row: 2 vehicles (centered) */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[calc(66.666%+1.5rem)] lg:max-w-[calc(66.666%+1.5rem)]">
              {filteredVehicles.slice(3, 5).map((vehicle) => (
                <VehicleCardContent 
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicleId === vehicle.id}
                  isOneWay={isOneWay}
                  isAirportTrip={isAirportTrip}
                  bookingData={bookingData}
                  onSelect={handleVehicleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Standard grid layout for other vehicle counts
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", getGridClass())}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCardContent 
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleId === vehicle.id}
              isOneWay={isOneWay}
              isAirportTrip={isAirportTrip}
              bookingData={bookingData}
              onSelect={handleVehicleSelect}
            />
          ))}
        </div>
      )}

      {/* Selected Vehicle Summary */}
      {selectedVehicle && (
        <div className="bg-white border-2 border-luxury-gold rounded-2xl p-5 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
            <h4 className="text-lg font-bold text-gray-900">Selected</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getImagePath(selectedVehicle.images?.[0])}
                alt={selectedVehicle.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('/api/uploads/')) {
                    target.src = selectedVehicle.images?.[0] || '/4.-alphard-colors-black.png';
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-lg mb-1">{selectedVehicle.name}</div>
              <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-luxury-gold/10 text-luxury-gold rounded-full text-xs font-medium">
                  {selectedVehicle.capacity} Pax
                </span>
                {isOneWay && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {isAirportTrip ? 'Airport Transfer' : 'Trip'}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{selectedVehicle.year}</span>
                {selectedVehicle.luggage && (
                  <>
                    <span>•</span>
                    <span>{selectedVehicle.luggage} luggage</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-luxury-gold">
                SGD {(() => {
                  if (isOneWay) {
                    return isAirportTrip
                      ? (selectedVehicle.priceAirportTransfer || 80)
                      : (selectedVehicle.pricePerHour || 75);
                  } else {
                    // Round-trip: calculate based on hours
                    const hours = parseInt(bookingData?.hours || '0');
                    if (hours <= 6) return selectedVehicle.price6Hours || 360;
                    if (hours <= 12) return selectedVehicle.price12Hours || 720;
                    // For > 12 hours
                    const hourlyRate = (selectedVehicle.price12Hours || 720) / 12;
                    return Math.round(hourlyRate * hours);
                  }
                })()}
              </div>
              <div className="text-sm text-gray-600">
                {isOneWay 
                  ? '/trip' 
                  : `/${bookingData?.hours || '0'}hrs`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
