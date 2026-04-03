'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

// Country data with phone codes and flags (sorted by popularity for luxury car rental markets)
const countries = [
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦' },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳' },
];

export interface PhoneInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  helperText,
  isRequired,
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  className,
  id,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Indonesia
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputId = id || `phone-input-${Math.random().toString(36).substr(2, 9)}`;

  // Parse initial value
  useEffect(() => {
    if (value) {
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.dialCode, '').trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/[^\d\s\-\(\)\+]/g, ''); // Only allow digits and common phone formatting
    setPhoneNumber(number);
    const fullNumber = selectedCountry.dialCode + (number ? ' ' + number : '');
    onChange?.(fullNumber);
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    const fullNumber = country.dialCode + (phoneNumber ? ' ' + phoneNumber : '');
    onChange?.(fullNumber);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn('w-full', className)}>
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
        <div className="flex">
          {/* Country Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'flex items-center px-3 py-2 border border-r-0 rounded-l-compact bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors',
                error ? 'border-red-500' : 'border-gray-300'
              )}
            >
              <span className="text-lg mr-2">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-compact shadow-lg max-h-64 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                
                {/* Country List */}
                <div className="overflow-y-auto max-h-48">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <span className="text-lg mr-3">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {country.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {country.dialCode}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            id={inputId}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            className={cn(
              'flex-1 px-3 py-2 border rounded-r-compact focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white transition-colors',
              error ? 'border-red-500' : 'border-gray-300'
            )}
          />
        </div>
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
};

export default PhoneInput;
