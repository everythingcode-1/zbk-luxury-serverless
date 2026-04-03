'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/utils/cn';
const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

export interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string | React.ReactNode;
  error?: string;
  isRequired?: boolean;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  showMapPreview?: boolean;
}

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter location',
  label,
  error,
  isRequired = false,
  className,
  inputClassName,
  icon,
  showMapPreview = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Geocode using Nominatim (OpenStreetMap)
  const geocode = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=my,id,sg&bounded=1&viewbox=95.0,-11.0,141.0,7.0`,
        {
          headers: {
            'User-Agent': 'ZBK Luxury Transport App'
          }
        }
      );
      
      const data: GeocodeResult[] = await response.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced geocoding
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value && value.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        geocode(value);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, geocode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectLocation = (location: GeocodeResult) => {
    onChange(location.display_name);
    setSelectedLocation({
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      name: location.display_name,
    });
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (value && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500',
            'dark:bg-gray-700 dark:text-white dark:border-gray-600',
            'bg-white text-gray-900',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            icon && 'pl-10',
            inputClassName
          )}
        />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}

        {/* Dropdown Suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((location, index) => (
              <button
                key={location.place_id}
                type="button"
                onClick={() => handleSelectLocation(location)}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  'flex items-center gap-3',
                  index === 0 && 'rounded-t-md',
                  index === suggestions.length - 1 && 'rounded-b-md'
                )}
              >
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {location.display_name.split(',').slice(1).join(',').trim()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Map Preview */}
      {showMapPreview && selectedLocation && (
        <div className="mt-4">
          <LocationMap
            lat={selectedLocation.lat}
            lon={selectedLocation.lon}
            locationName={selectedLocation.name}
            className="w-full h-48 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}
    </div>
  );
};

export default LocationInput;

