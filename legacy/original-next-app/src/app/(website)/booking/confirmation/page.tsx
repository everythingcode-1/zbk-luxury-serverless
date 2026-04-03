'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import PhoneInput from '@/components/atoms/PhoneInput';
import { cn } from '@/utils/cn';

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  category: string;
  capacity: number;
  price: number;
  carouselOrder?: number;
  images: string[];
  description?: string;
}

interface BookingConfirmationProps {
  vehicleId?: string;
  bookingData?: {
    tripType: 'oneWay' | 'roundTrip';
    pickupLocation: string;
    dropOffLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate?: string;
    returnTime?: string;
  };
}

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get data from URL params or sessionStorage
    const vehicleId = searchParams.get('vehicleId');
    const bookingDataStr = searchParams.get('bookingData') || sessionStorage.getItem('bookingData');
    
    if (bookingDataStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(bookingDataStr));
        setBookingData(parsed);
        if (parsed.vehicleId) {
          fetchVehicle(parsed.vehicleId);
        } else if (vehicleId) {
          fetchVehicle(vehicleId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing booking data:', error);
        setLoading(false);
      }
    } else if (vehicleId) {
      fetchVehicle(vehicleId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setVehicle(result.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
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

  const handleContinueBooking = async () => {
    if (!validateForm()) {
      return;
    }

    if (!vehicle || !bookingData) {
      alert('Missing booking information. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine service type
      let service = 'RENTAL';
      const hours = 8; // Default hours
      if (bookingData.pickupLocation?.toLowerCase().includes('airport') || 
          bookingData.dropOffLocation?.toLowerCase().includes('airport')) {
        service = 'AIRPORT_TRANSFER';
      }

      // Step 1: Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          vehicleId: vehicle.id,
          service: service,
          startDate: bookingData.pickupDate,
          endDate: bookingData.returnDate || bookingData.pickupDate,
          startTime: bookingData.pickupTime,
          duration: `${hours} hours`,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropOffLocation,
          status: 'PENDING',
          notes: `Trip Type: ${bookingData.tripType}`
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success) {
        console.error('Booking failed:', bookingResult.error);
        alert(`Booking failed: ${bookingResult.error}`);
        setIsProcessing(false);
        return;
      }

      const bookingId = bookingResult.data.id;
      console.log('Booking created successfully:', bookingId);

      // Save booking_id to sessionStorage before redirect to Stripe
      sessionStorage.setItem('pending_booking_id', bookingId);

      // Step 2: Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      // Check if response is ok
      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Checkout session HTTP error:', checkoutResponse.status, errorData);
        alert(`Payment setup failed (${checkoutResponse.status}): ${errorData.error || 'Unknown error'}`);
        setIsProcessing(false);
        return;
      }

      const checkoutResult = await checkoutResponse.json();

      if (checkoutResult.success && checkoutResult.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutResult.url;
      } else {
        console.error('Checkout session failed:', checkoutResult);
        alert(`Payment setup failed: ${checkoutResult.error || 'Unknown error'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('Network error. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBackToSearch = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vehicle || !bookingData) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Data Not Found</h2>
          <p className="text-gray-300 mb-6">We couldn't find the booking information. Please start a new booking.</p>
          <Button onClick={handleBackToSearch} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes || '00'} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-navy to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-gold rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Confirm Your Booking</h1>
          <p className="text-gray-300">Please review your booking details before proceeding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Details Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Selected Vehicle</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-64 h-48 rounded-xl overflow-hidden">
                  <Image
                    src={vehicle.images?.[0] || '/4.-alphard-colors-black.png'}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
                  <p className="text-gray-300 mb-4">{vehicle.model} ({vehicle.year})</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Capacity</p>
                      <p className="text-white font-semibold">{vehicle.capacity} Seats</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Price/Hour</p>
                      <p className="text-white font-semibold">SGD {vehicle.price || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Trip Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">Pickup Location</p>
                    <p className="text-white font-semibold">{bookingData.pickupLocation}</p>
                    {bookingData.pickupNote && (
                      <p className="text-yellow-400 text-sm mt-1 font-medium">📍 {bookingData.pickupNote}</p>
                    )}
                    <p className="text-gray-300 text-sm mt-1">
                      {formatDate(bookingData.pickupDate)} at {formatTime(bookingData.pickupTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">Drop-off Location</p>
                    <p className="text-white font-semibold">{bookingData.dropOffLocation}</p>
                    {bookingData.dropoffNote && (
                      <p className="text-yellow-400 text-sm mt-1 font-medium">📍 {bookingData.dropoffNote}</p>
                    )}
                    {bookingData.returnDate && bookingData.returnTime && (
                      <p className="text-gray-300 text-sm mt-1">
                        {formatDate(bookingData.returnDate)} at {formatTime(bookingData.returnTime)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Trip Type</span>
                    <span className="text-white font-semibold capitalize">
                      {bookingData.tripType === 'oneWay' ? 'One Way' : 'Round Trip'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card with Customer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Vehicle</span>
                  <span className="text-white font-semibold">SGD {vehicle.price || 0}/hr</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Estimated Hours</span>
                  <span className="text-white font-semibold">8 hrs</span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-semibold text-lg">Total Amount:</span>
                    <span className="text-white font-semibold text-lg">
                      SGD {((vehicle.price || 0) * 8).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/20">
                    <span className="text-sm text-gray-300">Deposit Required (20%):</span>
                    <span className="text-lg font-bold text-luxury-gold">
                      SGD {(((vehicle.price || 0) * 8) * 0.2).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information Form */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={customerInfo.name}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={customerInfo.email}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <PhoneInput
                      placeholder="Enter your phone number"
                      value={customerInfo.phone}
                      onChange={(value) => {
                        setCustomerInfo(prev => ({ ...prev, phone: value }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      error={errors.phone}
                      isRequired
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinueBooking}
                variant="primary"
                size="large"
                className="w-full mb-3 bg-luxury-gold hover:bg-luxury-gold/90"
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay Deposit (20%) - SGD ${(((vehicle.price || 0) * 8) * 0.2).toFixed(2)}`}
              </Button>
              
              <Button
                onClick={handleBackToSearch}
                variant="ghost"
                size="large"
                className="w-full text-white hover:bg-white/10"
                disabled={isProcessing}
              >
                Back to Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-deep-navy flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-white">Loading booking details...</p>
          </div>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
