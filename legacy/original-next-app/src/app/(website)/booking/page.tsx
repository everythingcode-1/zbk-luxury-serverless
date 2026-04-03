'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VehicleSearchModal from '@/components/organisms/VehicleSearchModal';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>({});

  useEffect(() => {
    // Check if this is a redirect from payment
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    
    if (sessionId && bookingId) {
      // Save booking_id to sessionStorage before redirect
      sessionStorage.setItem('pending_booking_id', bookingId);
      // Redirect to payment success page (without query parameters)
      router.replace('/payment/success');
      return;
    }

    // Store booking data from URL to sessionStorage if present
    const bookingDataParam = searchParams.get('bookingData');
    if (bookingDataParam) {
      try {
        const bookingData = JSON.parse(decodeURIComponent(bookingDataParam));
        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
        
        // Set initial data for VehicleSearchModal
        setInitialData({
          tripType: bookingData.tripType === 'oneWay' ? 'one-way' : 'round-trip',
          pickupDate: bookingData.pickupDate,
          pickupTime: bookingData.pickupTime,
          returnDate: bookingData.returnDate,
          returnTime: bookingData.returnTime,
          pickupLocation: bookingData.pickupLocation,
          dropOffLocation: bookingData.dropOffLocation,
          hours: bookingData.hours || '8',
          selectedVehicleId: bookingData.vehicleId || bookingData.selectedVehicleId,
        });
      } catch (error) {
        console.error('Error parsing booking data from URL:', error);
      }
    }
    
    // Open modal automatically
    setIsModalOpen(true);
  }, [searchParams, router]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Redirect to homepage when modal is closed
    router.push('/');
  };

  return (
    <>
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Complete Your Booking</h1>
          <p className="text-gray-300">Please wait while we prepare your booking form...</p>
        </div>
      </div>
      
      <VehicleSearchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={initialData}
      />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-deep-navy flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

