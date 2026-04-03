'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import LocationInput from '@/components/atoms/LocationInput';
import { BookingData } from '@/components/organisms/BookingForm';

export interface RideDetailsFormProps {
  className?: string;
  initialData?: Partial<BookingData>;
  onComplete: (data: Partial<BookingData>) => void;
}

const RideDetailsForm: React.FC<RideDetailsFormProps> = ({
  className,
  initialData = {},
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    tripType: initialData.tripType || 'one-way',
    pickupDate: initialData.pickupDate || '',
    pickupTime: initialData.pickupTime || '',
    returnDate: initialData.returnDate || '',
    returnTime: initialData.returnTime || '',
    pickupLocation: initialData.pickupLocation || '',
    dropOffLocation: initialData.dropOffLocation || '',
    pickupNote: initialData.pickupNote || '',
    dropoffNote: initialData.dropoffNote || '',
    hours: initialData.hours || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Trip type options
  const tripTypeOptions = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
  ];

  // Generate hour options from 1 to 12
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1) + ' Hour' + (i + 1 > 1 ? 's' : ''),
  }));

  // Generate time options (12-hour format with AM/PM)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour24 = i;
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour24String = i.toString().padStart(2, '0');
    return { 
      value: hour24String + ':00', // Keep 24-hour format for internal value
      label: hour12 + ':00 ' + ampm // Display 12-hour format with AM/PM
    };
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Check if location contains airport/bandara keywords
  const isAirportLocation = (location: string): boolean => {
    if (!location) return false;
    const locationLower = location.toLowerCase();
    const airportKeywords = ['airport', 'bandara', 'terminal', 'changi', 'soekarno', 'sukarno', 'hatta', 'ngurah rai'];
    return airportKeywords.some(keyword => locationLower.includes(keyword));
  };

  // Check if pickup location is airport
  const isPickupAirport = isAirportLocation(formData.pickupLocation);
  
  // Check if dropoff location is airport
  const isDropoffAirport = isAirportLocation(formData.dropOffLocation);

  // Calculate hours automatically for round-trip based on pickup and return datetime
  const calculateHours = () => {
    if (formData.tripType !== 'round-trip' || !formData.pickupDate || !formData.pickupTime || !formData.returnDate || !formData.returnTime) {
      return '';
    }

    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}`);
    
    const diffMs = returnDateTime.getTime() - pickupDateTime.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Round up to nearest hour
    
    return diffHours > 0 ? diffHours.toString() : '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required';
    }
    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required';
    }
    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    if (!formData.dropOffLocation) {
      newErrors.dropOffLocation = 'Drop-off location is required';
    }

    // Validate return date/time for round trip
    if (formData.tripType === 'round-trip') {
      if (!formData.returnDate) {
        newErrors.returnDate = 'Return date is required for round trip';
      }
      if (!formData.returnTime) {
        newErrors.returnTime = 'Return time is required for round trip';
      }
      
      // Validate return datetime is after pickup datetime
      if (formData.pickupDate && formData.pickupTime && formData.returnDate && formData.returnTime) {
        const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
        const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}`);
        
        if (returnDateTime <= pickupDateTime) {
          newErrors.returnDate = 'Return date & time must be after pickup date & time';
        }
      }
    }

    // Validate pickup date is not in the past
    if (formData.pickupDate) {
      const selectedDate = new Date(formData.pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // For round-trip, calculate hours automatically
      const dataToSubmit = {
        ...formData,
        hours: formData.tripType === 'round-trip' ? calculateHours() : formData.hours
      };
      onComplete(dataToSubmit);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={cn('max-w-2xl mx-auto w-full', className)}>
      <div className="mb-4 sm:mb-6 md:mb-8 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Enter Ride Details</h3>
        <p className="text-sm sm:text-base text-gray-600">Please provide your pickup and drop-off information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Trip Type Selection */}
        <div>
          <Select
            label="Trip Type"
            value={formData.tripType}
            onChange={(value) => handleInputChange('tripType', value)}
            options={tripTypeOptions}
            placeholder="Select trip type"
            isRequired
          />
        </div>

        {/* Pickup Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Pickup Date"
            value={formData.pickupDate}
            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
            error={errors.pickupDate}
            isRequired
            min={today}
          />
          
          <Select
            label="Pickup Time"
            value={formData.pickupTime}
            onChange={(value) => handleInputChange('pickupTime', value)}
            options={timeOptions}
            placeholder="Select time"
            error={errors.pickupTime}
            isRequired
          />
        </div>

        {/* Return Date and Time Row - Only show for round trip */}
        {formData.tripType === 'round-trip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Return Date"
              value={formData.returnDate}
              onChange={(e) => handleInputChange('returnDate', e.target.value)}
              error={errors.returnDate}
              isRequired
              min={formData.pickupDate || today}
            />
            
            <Select
              label="Return Time"
              value={formData.returnTime}
              onChange={(value) => handleInputChange('returnTime', value)}
              options={timeOptions}
              placeholder="Select time"
              error={errors.returnTime}
              isRequired
            />
          </div>
        )}

        {/* Location Fields */}
        <div className="space-y-4">
          <div>
            <LocationInput
              label="Pickup Location"
              placeholder="Enter pickup address or landmark"
              value={formData.pickupLocation}
              onChange={(value) => handleInputChange('pickupLocation', value)}
              error={errors.pickupLocation}
              isRequired
              icon={
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              }
            />
            
            {/* Show pickup note field if airport detected */}
            {isPickupAirport && (
              <div className="mt-3">
                <Input
                  type="text"
                  label="Additional Pickup Details"
                  placeholder="e.g., Terminal 1, Terminal 2, Terminal 3, Terminal 4, Gate A, Arrival Hall, etc."
                  value={formData.pickupNote || ''}
                  onChange={(e) => handleInputChange('pickupNote', e.target.value)}
                  error={errors.pickupNote}
                  helperText="Please specify terminal or gate details for accurate pickup"
                />
              </div>
            )}
          </div>
          
          <div>
            <LocationInput
              label="Drop-Off Location"
              placeholder="Enter destination address or landmark"
              value={formData.dropOffLocation}
              onChange={(value) => handleInputChange('dropOffLocation', value)}
              error={errors.dropOffLocation}
              isRequired
              icon={
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              }
            />
            
            {/* Show dropoff note field if airport detected */}
            {isDropoffAirport && (
              <div className="mt-3">
                <Input
                  type="text"
                  label="Additional Drop-Off Details"
                  placeholder="e.g., Terminal 1, Terminal 2, Terminal 3, Terminal 4, Gate A, Departure Hall, etc."
                  value={formData.dropoffNote || ''}
                  onChange={(e) => handleInputChange('dropoffNote', e.target.value)}
                  error={errors.dropoffNote}
                  helperText="Please specify terminal or gate details for accurate drop-off"
                />
              </div>
            )}
          </div>
        </div>

        {/* Auto-calculated Duration Display - Only for Round Trip */}
        {formData.tripType === 'round-trip' && formData.pickupDate && formData.pickupTime && formData.returnDate && formData.returnTime && (
          <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Duration (Auto-calculated)</div>
                <div className="text-xs text-gray-600">Based on pickup and return time</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-luxury-gold">
                  {calculateHours()} Hours
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 sm:pt-5 md:pt-6">
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full sm:w-auto px-8 sm:px-12"
          >
            Search Vehicles
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-luxury-gold bg-opacity-10 border border-luxury-gold rounded-compact">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-luxury-gold mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-luxury-gold mb-1">Booking Information</h4>
            <p className="text-xs text-gray-700 mb-2">
              <strong>One Way:</strong> Single journey from pickup to destination. Flat rate per trip.<br/>
              <strong>Round Trip:</strong> Return journey with automatic duration calculation. Priced per hour.
            </p>
            <p className="text-xs text-gray-700">
              Our premium vehicles are available 24/7. For round trip bookings, duration is automatically calculated 
              based on your pickup and return time. Standard packages: 6 hours and 12 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsForm;
