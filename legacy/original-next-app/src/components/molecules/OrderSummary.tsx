'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import PhoneInput from '@/components/atoms/PhoneInput';
import Badge from '@/components/atoms/Badge';
import { BookingData } from '@/components/organisms/BookingForm';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  category: string;
  capacity: number;
  luggage?: number;
  price?: number;
  priceAirportTransfer?: number;
  price6Hours?: number;
  price12Hours?: number;
  pricePerHour?: number;
  services?: string[];
  carouselOrder?: number;
  images: string[];
  features: string[];
}

export interface OrderSummaryProps {
  className?: string;
  bookingData: BookingData;
  onComplete: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  className,
  bookingData,
  onComplete,
  onBack,
}) => {
  const { customer, isAuthenticated } = useCustomerAuth();

  // Auto-fill customer info if logged in
  const getInitialCustomerInfo = () => {
    if (isAuthenticated && customer) {
      return {
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phoneNumber || '',
      };
    }
    return {
      name: bookingData.customerInfo?.name || '',
      email: bookingData.customerInfo?.email || '',
      phone: bookingData.customerInfo?.phone || '',
    };
  };

  const [customerInfo, setCustomerInfo] = useState(getInitialCustomerInfo());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // Update customer info when auth state changes
  useEffect(() => {
    if (isAuthenticated && customer) {
      setCustomerInfo({
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phoneNumber || '',
      });
    }
  }, [isAuthenticated, customer]);

  // Fetch vehicle data from API
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!bookingData.selectedVehicleId) {
        setLoadingVehicle(false);
        return;
      }

      try {
        const response = await fetch(`/api/vehicles/${bookingData.selectedVehicleId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setSelectedVehicle(result.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      } finally {
        setLoadingVehicle(false);
      }
    };

    fetchVehicle();
  }, [bookingData.selectedVehicleId]);
  
  // Calculate pricing using new pricing logic
  const hours = parseInt(bookingData.hours) || 0;
  
  // Use service type from bookingData if available (set in VehicleSelection)
  const isOneWay = bookingData.tripType === 'one-way';
  const [serviceType, setServiceType] = React.useState<'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL'>(
    bookingData.serviceType || 'RENTAL'
  );
  
  // Determine service type if not set
  React.useEffect(() => {
    if (isOneWay && !bookingData.serviceType) {
      const pickupLower = (bookingData.pickupLocation || '').toLowerCase();
      const dropoffLower = (bookingData.dropOffLocation || '').toLowerCase();
      
      // Airport keywords and names
      const airportKeywords = ['airport', 'terminal', 'bandara', 'changi', 'soekarno', 'hatta'];
      const airportNames = [
        'changi', 'suvarnabhumi', 'don mueang', 'noi bai', 'tan son nhat',
        'ninoy aquino', 'soekarno-hatta', 'ngurah rai', 'kuala lumpur',
        'klia', 'penang', 'phuket', 'incheon', 'narita', 'haneda',
        'singapore changi', 'hong kong', 'macau', 'dubai', 'heathrow'
      ];
      
      const checkLocation = (location: string) => {
        return airportKeywords.some(kw => location.includes(kw)) || 
               airportNames.some(name => location.includes(name));
      };
      
      const isAirportRelated = checkLocation(pickupLower) || checkLocation(dropoffLower);
      setServiceType(isAirportRelated ? 'AIRPORT_TRANSFER' : 'TRIP');
    } else if (!isOneWay) {
      setServiceType('RENTAL');
    } else if (bookingData.serviceType) {
      setServiceType(bookingData.serviceType);
    }
  }, [isOneWay, bookingData.serviceType, bookingData.pickupLocation, bookingData.dropOffLocation]);
  
  // Calculate price using new pricing logic
  const [priceCalculation, setPriceCalculation] = React.useState<{
    subtotal: number;
    midnightCharge: number;
    total: number;
    breakdown: any;
  } | null>(null);
  
  React.useEffect(() => {
    if (selectedVehicle) {
      import('@/utils/pricing').then(({ calculateBookingPriceNew }) => {
        const calculation = calculateBookingPriceNew({
          vehicle: {
            priceAirportTransfer: selectedVehicle.priceAirportTransfer,
            price6Hours: selectedVehicle.price6Hours,
            price12Hours: selectedVehicle.price12Hours,
            pricePerHour: selectedVehicle.pricePerHour
          },
          serviceType,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropOffLocation,
          startTime: bookingData.pickupTime,
          startDate: bookingData.pickupDate,
          hours: serviceType === 'RENTAL' ? hours : 0
        });
        setPriceCalculation(calculation);
      });
    }
  }, [selectedVehicle, serviceType, bookingData.pickupLocation, bookingData.dropOffLocation, bookingData.pickupTime, bookingData.pickupDate, hours]);
  
  const subtotal = priceCalculation?.subtotal || 0;
  const midnightCharge = priceCalculation?.midnightCharge || 0;
  const total = priceCalculation?.total || 0;
  
  // Generate service type label
  let serviceTypeLabel = '';
  if (serviceType === 'AIRPORT_TRANSFER') {
    serviceTypeLabel = 'Airport Transfer (One Way)';
  } else if (serviceType === 'TRIP') {
    serviceTypeLabel = 'Trip (One Way)';
  } else {
    if (hours <= 6) {
      serviceTypeLabel = `${hours} Hours Rental`;
    } else if (hours <= 12) {
      serviceTypeLabel = `${hours} Hours Rental`;
    } else {
      serviceTypeLabel = `${hours} Hours Rental (Extended)`;
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Pass customer info and service type to parent component
      // Payment calculation will be done in API using same logic
      await onComplete({
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        serviceType: serviceType, // Pass the detected service type
      });
      // If onComplete succeeds, redirect will happen in parent component
      // Don't reset isSubmitting here as we're redirecting
    } catch (error) {
      console.error('Error preparing payment:', error);
      alert('Error preparing payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loadingVehicle) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading vehicle details...</p>
      </div>
    );
  }

  if (!selectedVehicle) {
    return (
      <div className="text-center py-8">
        <p className="text-alert-red">Vehicle not found. Please go back and select a vehicle.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto w-full', className)}>
      <div className="mb-4 sm:mb-6 md:mb-8 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Order Summary</h3>
        <p className="text-sm sm:text-base text-gray-600">Review your booking details before proceeding to payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Order Summary */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Booking Details */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Pickup Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(bookingData.pickupDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Pickup Time:</span>
                <span className="font-semibold text-gray-900">{formatTime(bookingData.pickupTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Trip Type:</span>
                <span className="font-semibold text-gray-900">{bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}</span>
              </div>
              {!isOneWay && hours > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Duration:</span>
                  <span className="font-semibold text-gray-900">{hours} hour{hours > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="mb-2">
                  <span className="text-gray-700">Pickup Location:</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{bookingData.pickupLocation}</p>
                {bookingData.pickupNote && (
                  <p className="text-xs text-gray-600 mt-1 italic">Note: {bookingData.pickupNote}</p>
                )}
              </div>
              <div>
                <div className="mb-2">
                  <span className="text-gray-700">Drop-off Location:</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{bookingData.dropOffLocation}</p>
                {bookingData.dropoffNote && (
                  <p className="text-xs text-gray-600 mt-1 italic">Note: {bookingData.dropoffNote}</p>
                )}
              </div>
            </div>
          </div>

          {/* Selected Vehicle */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Selected Vehicle</h4>
            
            <div className="flex gap-4">
              <img
                src={selectedVehicle.images?.[0] || '/4.-alphard-colors-black.png'}
                alt={selectedVehicle.name}
                className="w-24 h-16 object-contain rounded"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-bold text-gray-900">{selectedVehicle.name}</h5>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {selectedVehicle.capacity} pax
                  {selectedVehicle.luggage && ` • ${selectedVehicle.luggage} luggage`}
                  {` • ${selectedVehicle.year}`}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-700">4.8 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Service Type:</span>
                <span className="font-semibold text-luxury-gold">{serviceTypeLabel}</span>
              </div>
              {isOneWay ? (
                <div className="flex justify-between">
                  <span className="text-gray-700">{serviceTypeLabel}:</span>
                  <span className="font-semibold text-gray-900">SGD {subtotal.toFixed(2)}</span>
                </div>
              ) : hours >= 12 && selectedVehicle?.price12Hours ? (
                <div className="flex justify-between">
                  <span className="text-gray-700">12 Hours Booking:</span>
                  <span className="font-semibold text-gray-900">SGD {selectedVehicle.price12Hours.toFixed(2)}</span>
                </div>
              ) : hours >= 6 && selectedVehicle?.price6Hours ? (
                <div className="flex justify-between">
                  <span className="text-gray-700">6 Hours Booking:</span>
                  <span className="font-semibold text-gray-900">SGD {selectedVehicle.price6Hours.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-700">Round Trip Price:</span>
                  <span className="font-semibold text-gray-900">SGD {subtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">SGD {subtotal.toFixed(2)}</span>
              </div>
              {midnightCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Midnight Pickup Charge:</span>
                  <span className="font-semibold text-gray-900">SGD {midnightCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-luxury-gold">SGD {total.toFixed(2)}</span>
                </div>
                <div className="mt-3 p-3 bg-luxury-gold bg-opacity-10 rounded-xl">
                  <p className="text-xs text-gray-700">
                    <strong className="text-luxury-gold">Note:</strong> Full payment is required to confirm your booking. 
                    A confirmation email will be sent to your email address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h4>
            
            <form onSubmit={handleContinueToPayment} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                isRequired
              />
              
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                isRequired
              />
              
              <PhoneInput
                label="Phone Number"
                placeholder="Enter your phone number"
                value={customerInfo.phone}
                onChange={(value) => handleInputChange('phone', value)}
                error={errors.phone}
                isRequired
              />

              {/* Terms and Conditions */}
              <div className="pt-4">
                <div className="flex items-start gap-3 p-4 bg-luxury-gold bg-opacity-10 border border-luxury-gold rounded-xl">
                  <div className="flex-shrink-0 w-5 h-5 text-luxury-gold mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-luxury-gold mb-1">Important Information</h5>
                    <p className="text-xs text-gray-700">
                      By placing this order, you agree to our terms and conditions. 
                      A confirmation will be sent to your email. Our driver will contact you 15 minutes before pickup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Responsive dan rapi untuk mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="large"
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all order-2 sm:order-1"
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Back</span>
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-lg shadow-lg transition-all order-1 sm:order-2 flex-1 sm:flex-initial bg-luxury-gold hover:bg-luxury-gold/90 text-gray-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Continue to Payment</span>
                      <span className="sm:hidden">Pay SGD {total.toFixed(2)}</span>
                      <span className="hidden sm:inline text-lg font-bold">SGD {total.toFixed(2)}</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
