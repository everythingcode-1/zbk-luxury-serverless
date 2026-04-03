'use client';

import React from 'react';
import FleetSection from '@/components/organisms/FleetSection';

export default function BookingDemoPage() {
  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Header */}
      <header className="bg-deep-navy border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-luxury-gold">RBK Luxury</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">Home</a>
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">Fleet</a>
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">Services</a>
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-deep-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Luxury Car Rental Booking Demo
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experience our streamlined 3-step booking process: Enter ride details, choose your vehicle, and place your order.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold bg-opacity-10 border border-luxury-gold rounded-compact">
            <svg className="w-5 h-5 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-luxury-gold font-medium">Click "Book Now" on any vehicle to start the booking process</span>
          </div>
        </div>
      </section>

      {/* Fleet Section with Booking */}
      <FleetSection showAll={true} />

      {/* Features Section */}
      <section className="bg-off-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-deep-navy mb-4">Booking Process Features</h3>
            <p className="text-lg text-charcoal max-w-2xl mx-auto">
              Our booking system is designed for simplicity and efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-deep-navy">1</span>
              </div>
              <h4 className="text-xl font-bold text-deep-navy mb-2">Enter Ride Details</h4>
              <p className="text-charcoal">
                Specify pickup date, time, location, drop-off location, and duration (1-12 hours)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-deep-navy">2</span>
              </div>
              <h4 className="text-xl font-bold text-deep-navy mb-2">Choose a Vehicle</h4>
              <p className="text-charcoal">
                Browse our premium fleet with filtering options and detailed vehicle information
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-deep-navy">3</span>
              </div>
              <h4 className="text-xl font-bold text-deep-navy mb-2">Place Order</h4>
              <p className="text-charcoal">
                Review booking details, enter customer information, and confirm your reservation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-navy border-t border-light-gray py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-charcoal">
            © 2024 RBK Luxury. Premium car rental booking system demo.
          </p>
        </div>
      </footer>
    </div>
  );
}
