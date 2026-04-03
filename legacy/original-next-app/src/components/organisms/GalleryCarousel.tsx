'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const GALLERY_IMAGES = Array.from({ length: 19 }, (_, i) => `/galery/${i + 1}.jpeg`);

export default function GalleryCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Duplicate images untuk seamless loop - perlu lebih banyak untuk smooth infinite scroll
  const duplicatedImages = [...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
    // Keep paused for a moment after drag
    setTimeout(() => {
      setIsPaused(false);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (carouselRef.current) {
        carouselRef.current.style.cursor = 'grab';
      }
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      setIsPaused(false);
    }, 500);
  };

  return (
    <section className="py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of premium vehicles and memorable moments
          </p>
          <p className="text-sm text-luxury-gold mt-2 font-medium">
            Drag to explore or hover to pause
          </p>
        </div>
      </div>

      <div className="relative w-full">
        {/* Gradient overlays untuk fade effect di pinggir - HANYA DESKTOP */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent z-10 pointer-events-none" />
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/50 to-transparent z-10 pointer-events-none" />

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="relative overflow-x-auto no-scrollbar"
          style={{
            cursor: 'grab',
            scrollBehavior: isDragging ? 'auto' : 'smooth',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => !isDragging && setIsPaused(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex gap-4 sm:gap-6"
            style={{
              width: 'fit-content',
              animation: isDragging ? 'none' : 'scroll 180s linear infinite',
              animationPlayState: isPaused || isDragging ? 'paused' : 'running',
              userSelect: 'none',
            }}
          >
            {duplicatedImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="flex-shrink-0"
                style={{
                  width: '350px',
                  height: '280px',
                  pointerEvents: isDragging ? 'none' : 'auto',
                }}
              >
                {/* Card dengan border */}
                <div className="w-full h-full rounded-xl border-2 border-luxury-gold/30 bg-white p-2 backdrop-blur-sm transition-all duration-300 hover:border-luxury-gold hover:shadow-2xl hover:shadow-luxury-gold/30">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={src}
                      alt={`Gallery image ${(index % GALLERY_IMAGES.length) + 1}`}
                      fill
                      sizes="350px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      quality={90}
                      loading="lazy"
                      unoptimized
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-gold/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${GALLERY_IMAGES.length} - ${GALLERY_IMAGES.length * 24}px));
          }
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

