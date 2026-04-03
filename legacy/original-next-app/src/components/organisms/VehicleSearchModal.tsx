'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/atoms/Button';
import RideDetailsForm from '@/components/molecules/RideDetailsForm';
import VehicleSelection from '@/components/molecules/VehicleSelection';
import OrderSummary from '@/components/molecules/OrderSummary';
import { BookingData } from '@/components/organisms/BookingForm';
import BookingForm from '@/components/organisms/BookingForm';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { gtagSendEvent, CONVERSION_LABELS } from '@/utils/googleAds';

export interface VehicleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<BookingData>;
}

const VehicleSearchModal: React.FC<VehicleSearchModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { token } = useCustomerAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>(initialData || {});

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Cleanup function - restore scroll when modal closes
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRideDetailsComplete = (data: Partial<BookingData>) => {
    const updatedData = { ...bookingData, ...data };
    setBookingData(updatedData);
    setCurrentStep(2);
  };

  const handleVehicleSelectComplete = (data: Partial<BookingData>) => {
    setBookingData({ ...bookingData, ...data });
    setCurrentStep(3);
  };

  const handleOrderSummaryComplete = async (data: Partial<BookingData>) => {
    // Update booking data with customer info
    const updatedBookingData = { ...bookingData, ...data };
    setBookingData(updatedBookingData);

    // Proceed with payment
    try {
      // Determine service type using same logic as OrderSummary
      const isOneWay = updatedBookingData.tripType === 'one-way';
      let serviceType: 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL' = 'RENTAL';
      
      if (updatedBookingData.serviceType) {
        // Use serviceType from OrderSummary if available
        serviceType = updatedBookingData.serviceType as 'AIRPORT_TRANSFER' | 'TRIP' | 'RENTAL';
      } else if (isOneWay) {
        // Determine service type for one-way trips
        const pickupLower = ((updatedBookingData.pickupLocation as string) || '').toLowerCase();
        const dropoffLower = ((updatedBookingData.dropOffLocation as string) || '').toLowerCase();
        
        // Airport keywords and names (same as OrderSummary)
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
        serviceType = isAirportRelated ? 'AIRPORT_TRANSFER' : 'TRIP';
      }
      
      // Service field for backward compatibility
      let service = 'RENTAL';
      if (serviceType === 'AIRPORT_TRANSFER') {
        service = 'AIRPORT_TRANSFER';
      } else if (serviceType === 'TRIP') {
        service = 'TRIP';
      }
      
      const hours = parseInt(updatedBookingData.hours as string) || 8;

      // Prepare booking data for API
      const bookingPayload = {
        customerName: updatedBookingData.customerInfo?.name,
        customerEmail: updatedBookingData.customerInfo?.email,
        customerPhone: updatedBookingData.customerInfo?.phone,
        vehicleId: updatedBookingData.selectedVehicleId,
        service: service,
        serviceType: serviceType,
        startDate: updatedBookingData.pickupDate,
        endDate: updatedBookingData.returnDate || updatedBookingData.pickupDate,
        startTime: updatedBookingData.pickupTime,
        duration: `${hours} hours`,
        pickupLocation: updatedBookingData.pickupLocation,
        dropoffLocation: updatedBookingData.dropOffLocation,
        pickupNote: updatedBookingData.pickupNote || null,
        dropoffNote: updatedBookingData.dropoffNote || null,
        status: 'PENDING',
        notes: `Trip Type: ${updatedBookingData.tripType}${updatedBookingData.returnTime ? `, Return Time: ${updatedBookingData.returnTime}` : ''}`
      };

      // Step 1: Create booking
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add customer token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success) {
        console.error('Booking failed:', bookingResult.error);
        alert(`Booking failed: ${bookingResult.error}`);
        return;
      }

      const bookingId = bookingResult.data.id;

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

      // Parse response regardless of status
      const checkoutResult = await checkoutResponse.json();
      console.log('🔍 Checkout response status:', checkoutResponse.status);
      console.log('🔍 Checkout result:', checkoutResult);

      if (!checkoutResponse.ok) {
        const errorMsg = checkoutResult.error || `HTTP ${checkoutResponse.status}: Unknown error`;
        console.error('❌ Checkout session creation failed:', errorMsg);
        alert(`Payment setup failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Check if we have a valid URL to redirect to
      if (!checkoutResult.success) {
        const errorMsg = checkoutResult.error || 'Failed to create checkout session';
        console.error('❌ Checkout session failed:', errorMsg);
        alert(`Payment setup failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const checkoutUrl = checkoutResult.url || checkoutResult.sessionUrl;
      if (!checkoutUrl) {
        console.error('❌ No checkout URL in response:', checkoutResult);
        console.error('❌ Full response:', JSON.stringify(checkoutResult, null, 2));
        alert('Payment setup failed: No checkout URL received from Stripe. Please contact support.');
        throw new Error('No checkout URL in response');
      }

      console.log('✅ Checkout session created successfully');
      console.log('✅ Checkout URL:', checkoutUrl);
      console.log('✅ Full checkout result:', JSON.stringify(checkoutResult, null, 2));
      
      // Track lead form submission conversion before redirecting to Stripe Checkout
      // Note: Payment completion with accurate value will be tracked on payment success page
      try {
        gtagSendEvent(checkoutUrl, CONVERSION_LABELS.SUBMIT_LEAD_FORM);
      } catch (gtagError) {
        console.warn('⚠️ Google Ads tracking error (non-blocking):', gtagError);
      }
      
      // CRITICAL: Redirect to Stripe Checkout immediately
      // Use multiple methods to ensure redirect happens
      console.log('🔄 Starting redirect to Stripe checkout...');
      
      // Method 1: window.location.href (most reliable, full page navigation)
      try {
        window.location.href = checkoutUrl;
        console.log('✅ Redirect method 1 executed: window.location.href');
      } catch (e) {
        console.error('❌ Redirect method 1 failed:', e);
      }
      
      // Method 2: window.location.replace (fallback, doesn't add to history)
      setTimeout(() => {
        try {
          const currentUrl = window.location.href;
          if (!currentUrl.includes('checkout.stripe.com') && !currentUrl.includes('stripe.com')) {
            console.warn('⚠️ Primary redirect may have failed, using window.location.replace');
            window.location.replace(checkoutUrl);
          }
        } catch (e) {
          console.error('❌ Redirect method 2 failed:', e);
        }
      }, 500);
      
      // Method 3: window.open as last resort (opens in new tab/window)
      setTimeout(() => {
        try {
          const currentUrl = window.location.href;
          if (!currentUrl.includes('checkout.stripe.com') && !currentUrl.includes('stripe.com')) {
            console.warn('⚠️ All redirect methods failed, trying window.open');
            const newWindow = window.open(checkoutUrl, '_blank');
            if (!newWindow) {
              alert('Please allow popups for this site to complete payment, or click here: ' + checkoutUrl);
            }
          }
        } catch (e) {
          console.error('❌ Redirect method 3 failed:', e);
          alert('Redirect failed. Please click this link to complete payment: ' + checkoutUrl);
        }
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Network error. Please try again.');
      throw error; // Re-throw to allow OrderSummary to handle it
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container - Full screen di mobile, centered di desktop */}
      <div className="absolute inset-0 sm:flex sm:items-center sm:justify-center sm:p-3 md:p-4 lg:p-6">
        {/* Modal Content - Full screen di mobile, responsive di desktop */}
        <div className="relative bg-white rounded-none sm:rounded-xl md:rounded-2xl shadow-2xl sm:max-w-6xl lg:max-w-7xl xl:max-w-[95rem] w-full h-full sm:h-[95vh] md:h-[92vh] lg:h-[90vh] flex flex-col overflow-hidden sm:border border-luxury-gold/30">
          {/* Header - Sticky di atas */}
          <div className="flex-shrink-0 sticky top-0 bg-white border-b border-luxury-gold/30 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 lg:py-6 flex items-center justify-between z-10 backdrop-blur-sm">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Book Your Ride</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 md:mt-1.5 font-medium">
                Step {currentStep} of 3: {
                  currentStep === 1 ? 'Ride Details' :
                  currentStep === 2 ? 'Vehicle Selection' :
                  'Order Summary'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator - Compact dan responsive */}
          <div className="flex-shrink-0 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 bg-gradient-to-r from-luxury-gold/5 via-white to-luxury-gold/5 border-b border-luxury-gold/20">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center w-full">
                      <div
                        className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 shadow-sm',
                          currentStep === step
                            ? 'bg-luxury-gold text-gray-900 shadow-md shadow-luxury-gold/30 scale-105'
                            : currentStep > step
                            ? 'bg-luxury-gold/90 text-gray-900'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        )}
                      >
                        {currentStep > step ? (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm">{step}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'mt-0.5 sm:mt-1 md:mt-1.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-semibold uppercase tracking-wide hidden sm:block transition-colors text-center',
                          currentStep >= step ? 'text-luxury-gold' : 'text-gray-400'
                        )}
                      >
                        {
                          step === 1 ? 'Ride Details' :
                          step === 2 ? 'Select Vehicle' :
                          'Review & Book'
                        }
                      </span>
                    </div>
                  </div>
                  {step < 3 && (
                    <div className="flex-1 mx-1.5 sm:mx-2 md:mx-2.5 lg:mx-3 h-0.5 relative">
                      <div className={cn(
                        'absolute inset-0 rounded-full transition-all duration-500',
                        currentStep > step ? 'bg-luxury-gold' : 'bg-gray-200'
                      )} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content Area - Flex-1 untuk mengisi sisa ruang, scrollable, no empty space */}
          <div className="flex-1 bg-white overflow-y-auto overflow-x-hidden min-h-0">
            <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
              {currentStep === 1 && (
                <RideDetailsForm
                  initialData={bookingData}
                  onComplete={handleRideDetailsComplete}
                />
              )}

              {currentStep === 2 && (
                <VehicleSelection
                  initialVehicleId={bookingData.selectedVehicleId}
                  bookingData={bookingData as BookingData}
                  onComplete={handleVehicleSelectComplete}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <OrderSummary
                  bookingData={bookingData as BookingData}
                  onComplete={async (data) => {
                    try {
                      await handleOrderSummaryComplete(data);
                      // Redirect to Stripe will happen in handleOrderSummaryComplete
                    } catch (error) {
                      // Error already handled in handleOrderSummaryComplete
                      console.error('Error in order summary completion:', error);
                    }
                  }}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSearchModal;

