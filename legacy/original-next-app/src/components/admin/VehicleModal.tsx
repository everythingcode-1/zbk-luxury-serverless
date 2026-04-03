'use client'

import { useState, useEffect } from 'react'
import { X, Car, Upload } from '@/components/admin/Icons'
import { getImagePath } from '@/utils/imagePath'

interface Vehicle {
  id?: string
  name: string
  model: string
  year: number
  status: string
  location: string
  plateNumber: string
  capacity: number
  luggage?: number
  color: string
  price?: number
  priceAirportTransfer?: number
  pricePerHour?: number
  price6Hours?: number
  price12Hours?: number
  services?: string[]
  carouselOrder?: number
  mileage: string
  features: string[]
  images: string[]
  description: string
}

interface VehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (vehicle: Vehicle) => void
  vehicle?: Vehicle | null
  mode: 'add' | 'edit'
}

export default function VehicleModal({ isOpen, onClose, onSave, vehicle, mode }: VehicleModalProps) {
  const [formData, setFormData] = useState<Vehicle>({
    name: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'AVAILABLE',
    location: 'Singapore',
    plateNumber: '',
    capacity: 4,
    luggage: 4,
    color: '',
    price: 0,
    priceAirportTransfer: 0,
    pricePerHour: 0,
    price6Hours: 0,
    price12Hours: 0,
    services: [],
    carouselOrder: undefined,
    mileage: '',
    features: [],
    images: [],
    description: ''
  })

  const [featuresInput, setFeaturesInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (vehicle && mode === 'edit') {
      setFormData({
        ...vehicle,
        features: Array.isArray(vehicle.features) ? vehicle.features : [],
        images: Array.isArray(vehicle.images) ? vehicle.images : [],
        services: Array.isArray(vehicle.services) ? vehicle.services : [],
        luggage: vehicle.luggage || 4,
        priceAirportTransfer: vehicle.priceAirportTransfer || 0,
        pricePerHour: (vehicle as any).pricePerHour || 0,
        price6Hours: vehicle.price6Hours || 0,
        price12Hours: vehicle.price12Hours || 0,
        carouselOrder: vehicle.carouselOrder || undefined
      })
      setFeaturesInput(Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '')
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'AVAILABLE',
        location: 'Singapore',
        plateNumber: '',
        capacity: 4,
        luggage: 4,
        color: '',
        price: 0,
        priceAirportTransfer: 0,
        pricePerHour: 0,
        price6Hours: 0,
        price12Hours: 0,
        services: [],
        carouselOrder: undefined,
        mileage: '',
        features: [],
        images: [],
        description: ''
      })
      setFeaturesInput('')
    }
  }, [vehicle, mode, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate minimum images requirement
    if (!Array.isArray(formData.images) || formData.images.length < 1) {
      alert('Please upload at least 1 image for the vehicle')
      return
    }
    
    // Validate required fields
    if (!formData.name || !formData.model || !formData.plateNumber) {
      alert('Please fill in all required fields (Name, Model, Plate Number)')
      return
    }
    
    // Validate pricing fields
    if (!formData.priceAirportTransfer || !formData.pricePerHour || !formData.price6Hours || !formData.price12Hours) {
      alert('Please fill in all pricing fields (Airport Transfer, Per Hour, 6 Hours, 12 Hours)')
      return
    }
    
    // Validate services
    if (!formData.services || formData.services.length === 0) {
      alert('Please select at least one service type (Trip/Airport Transfer or Rent)')
      return
    }
    
    const vehicleData = {
      ...formData,
      features: featuresInput.split(',').map(f => f.trim()).filter(f => f.length > 0),
      images: formData.images
    }
    
    // Include ID for update operations
    if (mode === 'edit' && vehicle?.id) {
      vehicleData.id = vehicle.id
      console.log('🔄 Updating vehicle with ID:', vehicle.id)
    } else {
      console.log('➕ Creating new vehicle')
    }
    
    console.log('💾 Saving vehicle data:', vehicleData)
    onSave(vehicleData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'capacity' || name === 'luggage'
        ? parseInt(value) || 0 
        : name === 'price' || name === 'priceAirportTransfer' || name === 'pricePerHour' || name === 'price6Hours' || name === 'price12Hours'
        ? parseFloat(value) || 0
        : value
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const currentServices = prev.services || []
      const newServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service]
      return {
        ...prev,
        services: newServices
      }
    })
  }

  const handleFileUpload = async (files: FileList) => {
    console.log('🔄 Starting file upload...', files.length, 'files')
    setIsUploading(true)

    try {
      // Validate files first
      const validFiles: File[] = []
      for (const file of Array.from(files)) {
        console.log('📁 Processing file:', file.name, file.type, file.size)
        
        if (!file.type.startsWith('image/')) {
          console.warn('❌ Invalid file type:', file.type)
          alert(`${file.name} is not an image file`)
          continue
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          console.warn('❌ File too large:', file.size)
          alert(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        validFiles.push(file)
      }

      if (validFiles.length === 0) {
        console.warn('⚠️ No valid files to upload')
        return
      }

      // Upload files to server
      const uploadFormData = new FormData()
      validFiles.forEach(file => {
        uploadFormData.append('files', file)
      })

      console.log('📤 Uploading to server...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Upload response:', result)

      if (result.success && result.files) {
        // Update state with server file paths
        const updatedImages = [...formData.images, ...result.files]
        console.log('🔄 Updated images array:', updatedImages)
        
        setFormData(prev => ({
          ...prev,
          images: updatedImages
        }))
        
        // Show success notification
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 3000)
        
        console.log('✅ State updated with server paths')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error) {
      console.error('❌ Error uploading files:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error uploading files: ${errorMessage}`)
    } finally {
      setIsUploading(false)
      console.log('🏁 Upload process completed')
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index]
    
    // Revoke object URL if it's a blob URL
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove)
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'add' ? 'Add a new vehicle to your fleet' : 'Update vehicle information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Mercedes S-Class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="S450"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BOOKED">Booked</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Jakarta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Carousel Order
                  <span className="text-xs text-gray-500 ml-2">(Optional - for display sorting)</span>
                </label>
                <input
                  type="number"
                  name="carouselOrder"
                  value={formData.carouselOrder || ''}
                  onChange={handleInputChange}
                  min="1"
                  max="99"
                  placeholder="1, 2, 3..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Set display order (e.g., 1 for first, 2 for second). Leave empty to sort by date.
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plate Number *
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="B 1234 ZBK"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mileage
                </label>
                <input
                  type="text"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="5000 km"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Luggage Capacity
                </label>
                <input
                  type="number"
                  name="luggage"
                  value={formData.luggage || 4}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="4"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing Information</h3>
            <div className="space-y-4">
              {/* One Way Pricing */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">One Way Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Airport Transfer Price (SGD) *
                    </label>
                    <input
                      type="number"
                      name="priceAirportTransfer"
                      value={formData.priceAirportTransfer || 0}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      placeholder="80"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      For airport-related locations
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Per Hour Price (SGD) *
                    </label>
                    <input
                      type="number"
                      name="pricePerHour"
                      value={formData.pricePerHour || 0}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Used for additional rental hours (&lt; 6 hours or &gt; 12 hours) and TRIP service
                    </p>
                  </div>
                </div>
              </div>

              {/* Rental Pricing */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rental per Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      6 Hours Booking Price (SGD) *
                    </label>
                    <input
                      type="number"
                      name="price6Hours"
                      value={formData.price6Hours || 0}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      placeholder="360"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      12 Hours Booking Price (SGD) *
                    </label>
                    <input
                      type="number"
                      name="price12Hours"
                      value={formData.price12Hours || 0}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      placeholder="720"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Services */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Services</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select the services available for this vehicle:
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services?.includes('TRIP') || false}
                    onChange={() => handleServiceToggle('TRIP')}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trip / Airport Transfer
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services?.includes('RENT') || false}
                    onChange={() => handleServiceToggle('RENT')}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rent
                  </span>
                </label>
              </div>
              {(!formData.services || formData.services.length === 0) && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Please select at least one service type
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Images</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Images
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                    isUploading 
                      ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' 
                      : isDragOver
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    {isUploading ? (
                      <div className="animate-spin mx-auto h-12 w-12 text-yellow-500">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="mt-4">
                      <label htmlFor="vehicle-images" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {isUploading 
                            ? 'Uploading images...' 
                            : isDragOver 
                              ? 'Drop images here!' 
                              : 'Click to upload or drag & drop images'
                          }
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, JPEG up to 5MB each • Multiple files supported
                        </span>
                      </label>
                      <input
                        id="vehicle-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileUpload(e.target.files)
                          }
                        }}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upload Success Notification */}
              {uploadSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Gambar berhasil diupload! File telah disimpan.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Current Images List */}
              {formData.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uploaded Images ({formData.images.length})
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Image {index + 1}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {image.split('/').pop()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Image URL Input (Alternative) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or add image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, input.value]
                          }))
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                      if (input.value) {
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, input.value]
                        }))
                        input.value = ''
                      }
                    }}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Features & Description</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Leather Seats, Sunroof, Premium Audio, GPS Navigation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Luxury sedan perfect for special occasions..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {mode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
