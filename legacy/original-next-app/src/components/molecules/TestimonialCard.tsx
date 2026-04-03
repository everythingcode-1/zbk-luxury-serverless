import React from 'react';
import { cn } from '@/utils/cn';

export interface TestimonialCardProps {
  name: string;
  title: string;
  avatar?: string;
  rating: number;
  testimonial: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  title,
  avatar,
  rating,
  testimonial,
  className,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={cn(
          'w-4 h-4',
          index < rating ? 'text-luxury-gold' : 'text-gray-300'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className={cn(
      'glass-effect rounded-standard p-6 text-white min-h-[280px] flex flex-col justify-between',
      className
    )}>
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {renderStars(rating)}
      </div>

      {/* Testimonial */}
      <blockquote className="text-sm italic leading-relaxed mb-6 flex-grow">
        "{testimonial}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-luxury-gold bg-opacity-20 rounded-full flex items-center justify-center border-2 border-luxury-gold">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-luxury-gold font-semibold text-lg">
              {name.charAt(0)}
            </span>
          )}
        </div>
        
        <div>
          <div className="font-semibold text-white text-sm">{name}</div>
          <div className="text-gray-300 text-xs">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
