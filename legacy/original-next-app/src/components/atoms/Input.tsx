import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, isRequired, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-alert-red ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-3 text-sm border rounded-compact transition-all duration-micro',
            'placeholder:text-gray-500 focus:outline-none focus:ring-0',
            error 
              ? 'border-alert-red bg-alert-red bg-opacity-5 text-gray-900 focus:border-alert-red focus:shadow-[0_0_0_3px_rgba(231,76,60,0.1)]'
              : 'border-light-gray bg-white text-gray-900 focus:border-luxury-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]',
            className
          )}
          {...props}
        />
        
        {error && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-alert-red">⚠</span>
            <span className="text-xs text-alert-red">{error}</span>
          </div>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-gray-700 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
