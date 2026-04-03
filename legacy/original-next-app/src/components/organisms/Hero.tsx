'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Button from '@/components/atoms/Button';
import { useAuth } from '@/contexts/AuthContext';

const AuthModal = dynamic(() => import('@/components/organisms/AuthModal'), { ssr: false });
const BookingForm = dynamic(() => import('@/components/organisms/BookingForm'), { ssr: false });
const VehicleSearchModal = dynamic(() => import('@/components/organisms/VehicleSearchModal'), { ssr: false });
const AlertModal = dynamic(() => import('@/components/molecules/AlertModal'), { ssr: false });

export interface HeroProps {
  onBookingClick?: () => void;
}

interface HeroSectionData {
  headline: string;
  description: string;
  image?: string;
}

const Hero: React.FC<HeroProps> = ({ onBookingClick }) => {
  const { isAuthenticated } = useAuth();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showVehicleSearchModal, setShowVehicleSearchModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [heroData, setHeroData] = useState<HeroSectionData>({
    headline: 'Premium Limousine Service in Singapore',
    description: 'Professional limousine rental services with premium Toyota Alphard & Hiace. Experience luxury limo transportation for airport transfers, city tours, corporate events, and special occasions. Book your elegant ride today.',
    image: '/Hero.jpg'
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  // Fetch hero section data from API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/hero-section');
        if (response.ok) {
          const data = await response.json();
          setHeroData({
            headline: data.headline || heroData.headline,
            description: data.description || heroData.description
          });
        }
      } catch (error) {
        console.error('Error fetching hero section:', error);
        // Use default values if fetch fails
      }
    };

    fetchHeroData();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setAlertModal({
      isOpen: true,
      message,
      type,
      title,
    });
  };

  const handleSearchVehicles = () => {
    setShowVehicleSearchModal(true);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setShowVehicleSearchModal(false);
    setShowBookingForm(true);
  };

  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      // Allow guest booking - no authentication required
      setShowBookingForm(true);
    }
  };


  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowBookingForm(true);
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
  };

  const handleBookingComplete = (bookingData: any) => {
    console.log('Booking completed:', bookingData);
    setShowBookingForm(false);
    showAlert(
      'Booking confirmed! You will receive a confirmation email shortly.',
      'success',
      'Booking Successful'
    );
  };

  const scrollToFleet = () => {
    const fleetSection = document.querySelector('[data-section="fleet"]');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const heroImageSrc = heroData.image || '/Hero.jpg';
  
  if (isLoading) {
    return (
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <div className="w-24 h-1 bg-luxury-gold/30 rounded-full mx-auto mb-8 skeleton"></div>
          <div className="w-[80%] h-12 bg-white/5 rounded-lg mx-auto mb-6 skeleton"></div>
          <div className="w-[60%] h-6 bg-white/5 rounded-lg mx-auto mb-10 skeleton"></div>
          <div className="w-48 h-14 bg-luxury-gold/10 rounded-full mx-auto skeleton"></div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageSrc}
          alt="ZBK Limousine Tours - Premium luxury transport service in Singapore with Toyota Alphard, Noah and Hiace vehicles"
          fill
          priority
          fetchPriority="high"
          loading="eager"
          unoptimized={heroImageSrc.startsWith('http')}
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
        {/* Subtle gold accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Gold accent line */}
        <div className="animate-fade-up">
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
        </div>

        {/* Badge */}
        <div className="animate-fade-up mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold/20 bg-luxury-gold/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse"></span>
            <span className="text-luxury-gold text-xs font-medium tracking-[0.2em] uppercase">Premium Limousine Service</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
          {heroData.headline}
        </h1>
        
        {/* Description */}
        <p className="animate-fade-up-delay text-base sm:text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          {heroData.description}
        </p>

        {/* Magic CTA Button */}
        <div className="animate-fade-up-delay">
          <button
            onClick={handleSearchVehicles}
            className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden rounded-full transition-all duration-500 animate-glow-pulse hover:scale-105 active:scale-[0.98]"
          >
            {/* Gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold via-[#E8C547] to-luxury-gold rounded-full"></span>
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            </span>

            {/* Inner glow border */}
            <span className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

            {/* Button text */}
            <span className="relative flex items-center gap-3 text-deep-navy font-bold text-lg tracking-wide">
              Book Your Ride
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Subtle helper text */}
          <p className="mt-5 text-gray-500 text-xs tracking-wide">
            No registration required &bull; Instant confirmation
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button onClick={scrollToFleet} className="group flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-white/60 tracking-[0.2em] uppercase font-light">Explore</span>
          <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center group-hover:border-luxury-gold/50 transition-colors duration-300">
            <div className="w-0.5 h-2 bg-white/50 rounded-full mt-1.5 animate-bounce group-hover:bg-luxury-gold/70 transition-colors duration-300"></div>
          </div>
        </button>
      </div>

      {/* Vehicle Search Modal */}
      <VehicleSearchModal
        isOpen={showVehicleSearchModal}
        onClose={() => setShowVehicleSearchModal(false)}
      />

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseBooking}></div>
            <div className="relative bg-deep-navy rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
              <BookingForm
                onClose={handleCloseBooking}
                onSubmit={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
        onSuccess={handleAuthSuccess}
      />


      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </section>
  );
};

export default Hero;
