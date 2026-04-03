import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';
import { getImagePath, isUploadedImage } from '@/utils/imagePath';

export interface VehicleCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  priceUnit?: string;
  category?: string;
  seats: number;
  transmission: 'Manual' | 'Automatic';
  year: number;
  rating?: number;
  isLuxury?: boolean;
  className?: string;
  onBookNow?: (id: string) => void;
  onLearnMore?: (id: string) => void;
  // Additional optional details
  brand?: string;
  model?: string;
  engine?: string;
  fuel?: string;
  doors?: number;
  specialNote?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  name,
  image,
  price,
  priceUnit = 'day',
  category,
  seats,
  transmission,
  year,
  rating,
  isLuxury = false,
  className,
  onBookNow,
  onLearnMore,
  brand,
  model,
  engine,
  fuel,
  doors,
  specialNote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const resolvedImageSrc = isUploadedImage(image) ? getImagePath(image) : image;
  const isStaticWebpUpload = resolvedImageSrc.startsWith('/uploads/') && resolvedImageSrc.toLowerCase().endsWith('.webp');

  const handleBookNow = () => {
    onBookNow?.(id);
  };

  const handleLearnMore = () => {
    onLearnMore?.(id);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if there are additional details to show
  const hasAdditionalDetails = brand || model || engine || fuel || doors || specialNote;

  return (
    <div className={cn(
      'bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border border-white/20 relative',
      'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-luxury-gold/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
      'flex flex-col h-full', // Added flex layout for consistent height
      className
    )}>
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {isUploadedImage(image) ? (
          isStaticWebpUpload ? (
            <Image
              src={resolvedImageSrc}
              alt={name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <img
              src={resolvedImageSrc}
              alt={name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/api/uploads/')) {
                  target.src = image.replace('/api/uploads/', '/uploads/');
                }
              }}
            />
          )
        ) : (
          <Image
            src={resolvedImageSrc}
            alt={name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500" />
        
        {/* Floating Rating Badge */}
        {rating && (
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-sm font-bold">{rating}</span>
          </div>
        )}

        {/* Luxury Crown Icon */}
        {isLuxury && (
          <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <svg className="w-8 h-8 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative z-10 p-6 flex flex-col flex-grow">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-luxury-gold transition-colors duration-300 leading-tight line-clamp-2">
            {name}
          </h3>
          <div className="h-0.5 w-12 bg-luxury-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Main Specifications */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
            <div className="w-8 h-8 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-1">
              <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">{seats}</span>
            <span className="text-xs text-gray-500 font-medium">Seats</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
            <div className="w-8 h-8 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-1">
              <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Auto</span>
            <span className="text-xs text-gray-500 font-medium">Trans</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
            <div className="w-8 h-8 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-1">
              <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">{year}</span>
            <span className="text-xs text-gray-500 font-medium">Year</span>
          </div>
        </div>

        {/* Collapsible Additional Details */}
        {hasAdditionalDetails && (
          <div className="mb-4">
            <button
              onClick={toggleExpanded}
              className="flex items-center justify-center w-full py-2 text-sm font-medium text-luxury-gold hover:text-luxury-gold-hover transition-colors duration-200"
            >
              <span className="mr-1">
                {isExpanded ? 'Show Less' : 'Show Details'}
              </span>
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded ? "rotate-180" : "rotate-0"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="pt-3 space-y-2">
                {brand && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Brand</span>
                    <span className="text-sm font-semibold text-gray-900">{brand}</span>
                  </div>
                )}
                {model && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Model</span>
                    <span className="text-sm font-semibold text-gray-900">{model}</span>
                  </div>
                )}
                {engine && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Engine</span>
                    <span className="text-sm font-semibold text-gray-900">{engine}cc</span>
                  </div>
                )}
                {fuel && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Fuel</span>
                    <span className="text-sm font-semibold text-gray-900">{fuel}</span>
                  </div>
                )}
                {doors && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Doors</span>
                    <span className="text-sm font-semibold text-gray-900">{doors}</span>
                  </div>
                )}
                {specialNote && (
                  <div className="pt-2">
                    <span className="text-xs font-medium text-gray-500">Special Note</span>
                    <p className="text-sm text-gray-700 mt-1 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                      {specialNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spacer to push content to bottom */}
        <div className="flex-grow"></div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">SGD {price}</span>
            <span className="text-sm text-gray-500">/{priceUnit}</span>
          </div>
          {isLuxury && (
            <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
          )}
        </div>

        {/* Modern Action Button */}
        <Button 
          variant="primary" 
          size="large" 
          className="w-full py-3 font-bold text-sm bg-gradient-to-r from-luxury-gold to-yellow-500 hover:from-luxury-gold-hover hover:to-yellow-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0"
          onClick={handleBookNow}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </span>
        </Button>
      </div>
    </div>
  );
};

export default VehicleCard;
