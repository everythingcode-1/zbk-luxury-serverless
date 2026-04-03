import React from 'react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, isRequired, id, options, placeholder, onChange, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-900 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-alert-red ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3.5 py-3 text-sm border rounded-compact transition-all duration-micro',
            'focus:outline-none focus:ring-0 appearance-none bg-no-repeat bg-right bg-[length:16px]',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]',
            error 
              ? 'border-alert-red bg-alert-red bg-opacity-5 text-gray-900 focus:border-alert-red focus:shadow-[0_0_0_3px_rgba(231,76,60,0.1)]'
              : 'border-light-gray bg-white text-gray-900 focus:border-luxury-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]',
            className
          )}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-deep-navy">
              {option.label}
            </option>
          ))}
        </select>
        
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

Select.displayName = 'Select';

export default Select;
