'use client'

import { useState, useEffect } from 'react'
import { Car, Plus, Edit, Trash, Eye, Settings, CheckCircle, XCircle, AlertCircle, X } from '@/components/admin/Icons'
import VehicleModal from '@/components/admin/VehicleModal'
import { getImagePath } from '@/utils/imagePath'

interface Vehicle {
  id: string
  name: string
  model: string
  year: number
  status: string
  location: string
  plateNumber: string
  capacity: number
  luggage?: number
  color: string
  priceAirportTransfer?: number
  pricePerHour?: number
  price6Hours?: number
  price12Hours?: number
  services?: string[]
  carouselOrder?: number
  purchaseDate: string
  purchasePrice: number
  mileage: string
  features: string[]
  images: string[]
  description: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Fetch vehicles from API
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/admin/vehicles')
      const data = await response.json()
      
      // Debug logging
      console.log('API Response Status:', response.status)
      console.log('API Response Data:', data)
      console.log('Is Array:', Array.isArray(data))
      
      if (Array.isArray(data)) {
        console.log('Vehicles count:', data.length)
        if (data.length > 0) {
          console.log('First vehicle:', data[0])
          console.log('First vehicle ID:', data[0].id)
        }
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setVehicles(data)
      } else {
        console.warn('API did not return array, using fallback data')
        // Fallback data for testing when database is not available
        setVehicles([
          {
            id: 'fallback-1',
            name: 'Toyota Alphard Executive (Demo)',
            model: 'Alphard',
            year: 2024,
            status: 'AVAILABLE',
            location: 'Singapore',
            plateNumber: 'SGX-DEMO-001',
            capacity: 6,
            luggage: 4,
            color: 'Pearl White',
            priceAirportTransfer: 80,
            pricePerHour: 60,
            price6Hours: 360,
            price12Hours: 720,
            services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'],
            purchaseDate: '2024-01-15',
            purchasePrice: 150000,
            mileage: '2500 km',
            features: ['Leather Seats', 'Premium Audio', 'Captain Chairs'],
            images: ['/4.-alphard-colors-black.png'],
            description: 'Demo vehicle - Database not connected'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = () => {
    setSelectedVehicle(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleViewVehicle = (vehicle: Vehicle) => {
    setPreviewVehicle(vehicle)
    setIsPreviewModalOpen(true)
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (deleteConfirm === vehicleId) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          setVehicles(vehicles.filter(v => v.id !== vehicleId))
          setDeleteConfirm(null)
        } else {
          alert('Failed to delete vehicle')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        alert('Error deleting vehicle')
      }
    } else {
      setDeleteConfirm(vehicleId)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      const url = modalMode === 'add' ? '/api/admin/vehicles' : `/api/vehicles/${selectedVehicle?.id}`
      const method = modalMode === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      })
      
      const data = await response.json()
      if (response.ok && data.success) {
        const vehicleData = data.data || data // Support both formats for backward compatibility
        if (modalMode === 'add') {
          setVehicles([...vehicles, vehicleData])
        } else {
          setVehicles(vehicles.map(v => v.id === selectedVehicle?.id ? vehicleData : v))
        }
        setIsModalOpen(false)
        setSelectedVehicle(null)
        // Refresh vehicles list to get updated stats
        fetchVehicles()
      } else {
        alert(data.error || 'Failed to save vehicle')
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Error saving vehicle')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'BOOKED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'MAINTENANCE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'OUT_OF_SERVICE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading vehicles...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Vehicle Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your luxury vehicle fleet
          </p>
        </div>
        <button 
          onClick={handleAddVehicle}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{vehicles.length}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Car className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'AVAILABLE').length : 0}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Booked</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'BOOKED' || v.status === 'RESERVED' || v.status === 'IN_USE').length : 0}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mt-1 sm:mt-2">{Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'MAINTENANCE').length : 0}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles List - Desktop Table / Mobile Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Vehicle List
          </h2>
        </div>
        
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Model & Year
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
                <tr key={vehicle.id || `vehicle-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.name}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {vehicle.model} ({vehicle.year})
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {vehicle.plateNumber}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewVehicle(vehicle)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Vehicle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditVehicle(vehicle)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Edit Vehicle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className={`p-1 rounded transition-colors ${
                          deleteConfirm === vehicle.id 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                            : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={deleteConfirm === vehicle.id ? "Click again to confirm delete" : "Delete Vehicle"}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
            <div key={vehicle.id || `vehicle-${index}`} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Plate:</span>
                  <span>{vehicle.plateNumber}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-medium">Capacity:</span>
                  <span>{vehicle.capacity} seats</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => handleViewVehicle(vehicle)}
                  className="flex-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => handleEditVehicle(vehicle)}
                  className="flex-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 px-3 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    deleteConfirm === vehicle.id 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span>{deleteConfirm === vehicle.id ? 'Confirm?' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
        mode={modalMode}
      />

      {/* Preview Modal */}
      {isPreviewModalOpen && previewVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Vehicle Preview
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    Preview vehicle details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {previewVehicle.images && previewVehicle.images.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <img
                    src={getImagePath(previewVehicle.images[0])}
                    alt={previewVehicle.name}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/api/uploads/')) {
                        target.src = previewVehicle.images[0]; // Try direct path
                      }
                    }}
                  />
                </div>
              )}
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {previewVehicle.name}
              </h1>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Model</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewVehicle.model} ({previewVehicle.year})
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Plate Number</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewVehicle.plateNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(previewVehicle.status)}`}>
                    {previewVehicle.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewVehicle.capacity} seats
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Color</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewVehicle.color}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewVehicle.location}
                  </p>
                </div>
              </div>

              {previewVehicle.features && previewVehicle.features.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {previewVehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewVehicle.description && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {previewVehicle.description}
                  </p>
                </div>
              )}
              
              {/* Pricing Information */}
              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold">Pricing Information</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 space-y-3">
                  {/* One Way Services */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">One Way Services</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {previewVehicle.priceAirportTransfer && (
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Airport Transfer</p>
                          <p className="text-base sm:text-lg font-bold text-luxury-gold">SGD {previewVehicle.priceAirportTransfer.toFixed(2)}</p>
                        </div>
                      )}
                      {(previewVehicle as any).pricePerHour && (
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Per Hour</p>
                          <p className="text-base sm:text-lg font-bold text-luxury-gold">SGD {(previewVehicle as any).pricePerHour.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rental per Hours */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Rental per Hours</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {previewVehicle.price6Hours && (
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">6 Hours</p>
                          <p className="text-base sm:text-lg font-bold text-luxury-gold">SGD {previewVehicle.price6Hours.toFixed(2)}</p>
                        </div>
                      )}
                      {previewVehicle.price12Hours && (
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">12 Hours</p>
                          <p className="text-base sm:text-lg font-bold text-luxury-gold">SGD {previewVehicle.price12Hours.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
