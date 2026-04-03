import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'medium', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-micro ease-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';
    
    const variants = {
      primary: 'bg-luxury-gold text-deep-navy hover:bg-luxury-gold-hover active:bg-luxury-gold-active active:scale-[0.98] hover:shadow-glow',
      secondary: 'bg-transparent border-[1.5px] border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:bg-opacity-10 hover:border-luxury-gold-hover active:bg-luxury-gold active:text-deep-navy',
      ghost: 'bg-transparent border border-charcoal text-deep-navy hover:bg-off-white hover:border-deep-navy'
    };
    
    const sizes = {
      small: 'px-4 py-2 text-sm rounded-compact',
      medium: 'px-8 py-3 text-sm rounded-compact',
      large: 'px-10 py-4 text-base rounded-compact'
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
