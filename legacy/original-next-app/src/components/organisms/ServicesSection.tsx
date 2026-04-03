'use client';

import React from 'react';
import ServiceCard from '@/components/molecules/ServiceCard';
import { cn } from '@/utils/cn';

const services = [
  {
    id: 'airport-transport',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    title: 'Airport Limousine Transfer',
    description: 'Reliable and punctual airport limo transfers in Singapore. Professional chauffeurs ensure comfortable journeys to and from the airport with premium limousines, flight monitoring, and meet-and-greet services.',
  },
  {
    id: 'city-tour-hourly',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'City Tour Limousine Rental',
    description: 'Flexible limo rental for city exploration and day tours. Perfect for sightseeing, business meetings, or personal errands with competitive rates and knowledgeable local chauffeurs in premium limousines.',
  },
  {
    id: 'corporate-event',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Corporate Limousine Service',
    description: 'Professional limo transportation for corporate events and business functions. Reliable service for conferences, meetings, and company gatherings with executive-level comfort, punctuality, and premium limousine vehicles.',
  },
];

export interface ServicesSectionProps {
  className?: string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ className }) => {
  const handleServiceClick = (serviceId: string) => {
    console.log('Service clicked:', serviceId);
    // Handle navigation to service details
  };

  return (
    <section className={cn('py-16 lg:py-20 bg-gradient-light', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Premium Limousine Services in Singapore
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            Discover our comprehensive range of professional limo rental services designed to meet your every need. Experience elegance, comfort, and reliability with our premium limousine fleet.
          </p>
          
          {/* Decorative divider */}
          <div className="w-16 h-1 bg-luxury-gold mx-auto rounded-full"></div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-start">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                onClick={() => handleServiceClick(service.id)}
              />
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 pt-12 border-t border-light-gray">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-micro">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Best Price Guarantee
              </h3>
              <p className="text-sm text-gray-300">
                Competitive rates with no hidden fees
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-micro">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Fully Insured
              </h3>
              <p className="text-sm text-gray-300">
                Comprehensive insurance coverage included
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-micro">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Instant Booking
              </h3>
              <p className="text-sm text-gray-300">
                Quick and easy online reservation system
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-micro">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                24/7 Support
              </h3>
              <p className="text-sm text-gray-300">
                Round-the-clock customer assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
