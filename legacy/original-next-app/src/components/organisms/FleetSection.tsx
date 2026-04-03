'use client';

import React, { useState, useEffect } from 'react';
import VehicleCard from '@/components/molecules/VehicleCard';
import Button from '@/components/atoms/Button';
import VehicleSearchModal from '@/components/organisms/VehicleSearchModal';
import { cn } from '@/utils/cn';
import { getImagePath } from '@/utils/imagePath';

interface Vehicle {
  id: string
  name: string
  model: string
  year: number
  status: string
  location: string
  plateNumber: string
  capacity: number
  luggage?: number
  color: string
  pricePerHour?: number
  priceAirportTransfer?: number
  price6Hours?: number
  price12Hours?: number
  price?: number
  minimumHours?: number
  carouselOrder?: number
  features: string[]
  images: string[]
  description?: string
  purchasePrice?: number
}

export interface FleetSectionProps {
  className?: string;
  showAll?: boolean;
  onViewAll?: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({
  className,
  showAll = false,
  onViewAll,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      const result = await response.json()
      // Use the data from the API response
      const availableVehicles = result.success && Array.isArray(result.data) 
        ? result.data.filter((v: any) => v.status === 'AVAILABLE') 
        : []
      setVehicles(availableVehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const vehiclesToShow = showAll ? vehicles : vehicles.slice(0, 4);
  const vehicleCount = vehiclesToShow.length;

  // Determine grid layout based on vehicle count
  const getGridClass = () => {
    // For desktop (lg breakpoint and above)
    if (vehicleCount === 4) {
      // 4 vehicles: 2x2 grid
      return "lg:grid-cols-2";
    } else if (vehicleCount === 5) {
      // 5 vehicles: 3 on top, 2 on bottom (centered)
      return "lg:grid-cols-3";
    } else if (vehicleCount === 2) {
      // 2 vehicles: 2x1 grid
      return "lg:grid-cols-2";
    } else {
      // Default: 3 columns for 1, 3, 6+ vehicles
      return "lg:grid-cols-3";
    }
  };

  const handleBookNow = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowBookingForm(true);
  };

  const handleLearnMore = (vehicleId: string) => {
    console.log('Learn more about vehicle:', vehicleId);
    // Handle navigation to vehicle details
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
    setSelectedVehicleId('');
  };

  return (
    <section className={cn('py-16 lg:py-20 bg-deep-navy', className)} data-section="fleet">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Only show when not showing all vehicles (i.e., not on fleet page) */}
        {!showAll && (
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our Premium Fleet
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              Choose from our carefully curated collection of luxury vehicles, each maintained to the highest standards for your comfort and safety.
            </p>
            
            {/* Decorative divider */}
            <div className="w-16 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        )}

        {/* Vehicle Grid */}
        {vehicleCount === 5 ? (
          // Special layout for 5 vehicles: 3 on top, 2 on bottom (centered)
          <div className={cn("mb-12", showAll && "mt-8")}>
            {/* Top row: 3 vehicles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                vehiclesToShow.slice(0, 3).map((vehicle: Vehicle, index: number) => (
                  <div 
                    key={vehicle.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <VehicleCard
                      id={vehicle.id}
                      name={vehicle.name}
                      image={vehicle.images?.[0] ? getImagePath(vehicle.images[0]) : '/4.-alphard-colors-black.png'}
                      price={vehicle.pricePerHour || vehicle.price || 0}
                      priceUnit="trip"
                      seats={vehicle.capacity}
                      transmission="Automatic"
                      year={vehicle.year}
                      rating={4.8}
                      isLuxury={true}
                      brand={vehicle.name.split(' ')[0]}
                      model={vehicle.model}
                      specialNote={vehicle.description}
                      onBookNow={handleBookNow}
                      onLearnMore={handleLearnMore}
                    />
                  </div>
                ))
              )}
            </div>
            {/* Bottom row: 2 vehicles (centered) */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[calc(66.666%+1rem)] lg:max-w-[calc(66.666%+1rem)]">
                {loading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index + 3} className="animate-pulse">
                      <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                      <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                    </div>
                  ))
                ) : (
                  vehiclesToShow.slice(3, 5).map((vehicle: Vehicle, index: number) => (
                    <div 
                      key={vehicle.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <VehicleCard
                        id={vehicle.id}
                        name={vehicle.name}
                        image={vehicle.images?.[0] || '/4.-alphard-colors-black.png'}
                        price={vehicle.pricePerHour || vehicle.price || 0}
                        priceUnit="trip"
                        seats={vehicle.capacity}
                        transmission="Automatic"
                        year={vehicle.year}
                        rating={4.8}
                        isLuxury={true}
                        brand={vehicle.name.split(' ')[0]}
                        model={vehicle.model}
                        specialNote={vehicle.description}
                        onBookNow={handleBookNow}
                        onLearnMore={handleLearnMore}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          // Standard grid layout for other vehicle counts
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-8 mb-12",
            getGridClass(),
            showAll && "mt-8"
          )}>
            {loading ? (
              // Loading skeleton
              Array.from({ length: showAll ? 6 : 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                </div>
              ))
            ) : vehiclesToShow.length > 0 ? (
              vehiclesToShow.map((vehicle: Vehicle, index: number) => (
                <div 
                  key={vehicle.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <VehicleCard
                    id={vehicle.id}
                    name={vehicle.name}
                    image={vehicle.images?.[0] ? getImagePath(vehicle.images[0]) : '/4.-alphard-colors-black.png'}
                    price={vehicle.pricePerHour || vehicle.price || 0}
                    priceUnit="trip"
                    seats={vehicle.capacity}
                    transmission="Automatic"
                    year={vehicle.year}
                    rating={4.8}
                    isLuxury={true}
                    brand={vehicle.name.split(' ')[0]}
                    model={vehicle.model}
                    specialNote={vehicle.description}
                    onBookNow={handleBookNow}
                    onLearnMore={handleLearnMore}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300 text-lg">No vehicles available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Please check back later or contact us for assistance.</p>
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        {!showAll && (
          <div className="text-center">
            <Button 
              variant="secondary" 
              size="large"
              onClick={onViewAll}
              className="px-12"
            >
              View All Vehicles
            </Button>
          </div>
        )}

      </div>

      {/* Booking Modal - Menggunakan VehicleSearchModal yang sama seperti Hero */}
      <VehicleSearchModal
        isOpen={showBookingForm}
        onClose={handleCloseBooking}
        initialData={{ selectedVehicleId }}
      />
    </section>
  );
};

export default FleetSection;
