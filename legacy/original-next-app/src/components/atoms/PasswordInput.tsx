'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, helperText, isRequired, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-input-${Math.random().toString(36).substr(2, 9)}`;
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full px-3 py-2 pr-10 border rounded-compact transition-all duration-200',
              'placeholder:text-gray-500 focus:outline-none focus:ring-2',
              error 
                ? 'border-red-500 bg-red-50 text-gray-900 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 bg-white text-gray-900 focus:border-luxury-gold focus:ring-luxury-gold focus:ring-opacity-20',
              className
            )}
            {...props}
          />
          
          {/* Toggle Password Visibility Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              // Eye Slash Icon (Hide)
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" 
                />
              </svg>
            ) : (
              // Eye Icon (Show)
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </svg>
            )}
          </button>
        </div>
        
        {error && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-red-500">⚠</span>
            <span className="text-xs text-red-500">{error}</span>
          </div>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
