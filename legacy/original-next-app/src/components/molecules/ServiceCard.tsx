import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  className,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  return (
    <div 
      className={cn(
        'flex gap-5 p-6 bg-off-white border border-light-gray rounded-standard transition-all duration-entrance hover:bg-light-gray hover:shadow-md group cursor-pointer',
        !isExpanded && 'lg:h-full',
        className
      )}
      onClick={onClick}
    >
      {/* Icon Section */}
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-gradient-primary rounded-standard flex items-center justify-center shadow-[0_8px_16px_rgba(212,175,55,0.2)] group-hover:shadow-[0_12px_24px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-all duration-entrance">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-luxury-gold transition-colors duration-micro">
          {title}
        </h3>
        
        <p className={cn(
          "text-sm text-gray-300 leading-relaxed mb-6 flex-1",
          !isExpanded && "lg:line-clamp-3"
        )}>
          {description}
        </p>
        
        {/* Learn More button - hidden on mobile, functional on desktop */}
        <div 
          className="hidden lg:flex items-center text-luxury-gold font-semibold text-sm hover:underline transition-all duration-micro cursor-pointer"
          onClick={handleLearnMoreClick}
        >
          {isExpanded ? 'Show Less' : 'Learn More'}
          <svg 
            className={cn(
              "w-4 h-4 ml-1 transition-transform duration-micro",
              isExpanded ? "rotate-180" : "group-hover:translate-x-1"
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
