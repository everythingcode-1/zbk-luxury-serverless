import React from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { cn } from '@/utils/cn';

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
  </div>
);

// Dynamic imports with loading states
export const DynamicTestimonials = dynamic(
  () => import('@/components/organisms/TestimonialsSectionOptimized'),
  {
    loading: () => (
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-deep-navy mb-6">
              What Our Clients Say
            </h2>
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const DynamicBookingForm = dynamic(
  () => import('@/components/organisms/BookingForm'),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const DynamicAuthModal = dynamic(
  () => import('@/components/organisms/AuthModal'),
  {
    loading: () => null,
    ssr: false
  }
);

export const DynamicVehicleSearch = dynamic(
  () => import('@/components/organisms/VehicleSearchModal'),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4">
                  <div className="h-40 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Optimized Image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '',
  priority = false 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError ? 'hidden' : ''
        )}
        style={{
          backgroundColor: '#f3f4f6',
        }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
};
