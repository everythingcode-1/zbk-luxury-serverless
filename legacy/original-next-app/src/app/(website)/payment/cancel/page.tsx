'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/atoms/Button';

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-navy to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-300 mb-8">Your payment was not completed</p>
          
          {bookingId && (
            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <p className="text-gray-300 mb-4">
                Your booking <span className="text-white font-semibold">#{bookingId}</span> is still pending payment.
              </p>
              <p className="text-sm text-gray-400">
                You can complete the payment later or contact us if you need assistance.
              </p>
            </div>
          )}
          
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-300">
              <strong className="text-yellow-400">Note:</strong> Your booking has been saved but is not confirmed until payment is completed.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                if (bookingId) {
                  router.push(`/booking/confirmation?booking_id=${bookingId}`)
                } else {
                  router.push('/')
                }
              }}
              variant="primary"
              size="large"
              className="bg-luxury-gold hover:bg-luxury-gold/90"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="large"
              className="text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
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
      <PaymentCancelContent />
    </Suspense>
  );
}

