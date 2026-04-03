import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'luxury' | 'success' | 'warning' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'luxury', 
  size = 'medium', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';
  
  const variants = {
    luxury: 'bg-luxury-gold text-deep-navy',
    success: 'bg-success-green text-white',
    warning: 'bg-alert-red text-white',
    info: 'bg-info-blue text-white',
    neutral: 'bg-light-gray text-charcoal'
  };
  
  const sizes = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
