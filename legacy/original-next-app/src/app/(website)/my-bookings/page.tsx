'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import Image from 'next/image';
import { Calendar, MapPin, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  capacity: number;
  carouselOrder?: number;
  images: string[];
}

interface Booking {
  id: string;
  bookingNumber: string;
  vehicleId: string;
  vehicle: Vehicle;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  tripType: string;
  serviceType: string | null;
  totalPrice: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const MyBookingsPage = () => {
  const router = useRouter();
  const { customer, isAuthenticated, token, isLoading: authLoading } = useCustomerAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/customer/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.message || 'Failed to load bookings');
        }
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchBookings();
    }
  }, [isAuthenticated, token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="h-5 w-5" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-navy to-luxury-gold/10 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-navy to-luxury-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-300">View and manage your booking history</p>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-deep-navy font-bold text-2xl">
                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-gray-300">{customer.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-white mt-4">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 text-center border border-white/20">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-gray-300 mb-6">Start your journey by booking your first ride</p>
            <button
              onClick={() => router.push('/booking')}
              className="bg-luxury-gold hover:bg-opacity-90 text-deep-navy font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Book Now
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:border-luxury-gold/50 transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Vehicle Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        {booking.vehicle.images && booking.vehicle.images.length > 0 ? (
                          <Image
                            src={booking.vehicle.images[0]}
                            alt={booking.vehicle.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {booking.vehicle.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {booking.vehicle.model} • {booking.vehicle.year}
                        </p>
                        <p className="text-luxury-gold text-sm font-medium">
                          Booking #{booking.bookingNumber}
                        </p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-white font-medium">{booking.pickupLocation}</p>
                          <p className="text-gray-300">to {booking.dropoffLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-luxury-gold" />
                        <p className="text-white text-sm">
                          {formatDate(booking.pickupDate)} at {booking.pickupTime}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-luxury-gold" />
                        <p className="text-white text-sm font-semibold">
                          SGD {booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                        {getStatusIcon(booking.bookingStatus)}
                        <span className="text-sm font-medium capitalize">{booking.bookingStatus}</span>
                      </div>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {getStatusIcon(booking.paymentStatus)}
                        <span className="text-sm font-medium capitalize">{booking.paymentStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-gray-400 text-xs">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                    {booking.serviceType && (
                      <span className="text-luxury-gold text-xs font-medium">
                        {booking.serviceType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
