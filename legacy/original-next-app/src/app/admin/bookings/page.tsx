'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Eye, Edit, CheckCircle, XCircle, AlertCircle, BarChart3, X } from '@/components/admin/Icons'

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleId: string
  service: string
  startDate: string
  endDate: string
  startTime: string
  duration: string
  pickupLocation: string
  dropoffLocation: string
  pickupNote?: string
  dropoffNote?: string
  totalAmount: number
  depositAmount?: number
  status: string
  paymentStatus?: string
  stripeSessionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  vehicle?: {
    name: string
    model: string
    plateNumber: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    thisMonth: 0,
  })

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings')
      const data = await response.json()
      const bookingsData = Array.isArray(data) ? data : []
      setBookings(bookingsData)
      
      // Calculate stats from real data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const total = bookingsData.length
      const confirmed = bookingsData.filter((b: Booking) => b.status === 'CONFIRMED').length
      const pending = bookingsData.filter((b: Booking) => b.status === 'PENDING').length
      const thisMonth = bookingsData.filter((b: Booking) => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate >= startOfMonth
      }).length
      
      setStats({
        total,
        confirmed,
        pending,
        thisMonth,
      })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status?: string) => {
    if (status === 'PAID') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
    if (status === 'FAILED') return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Booking Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage customer bookings from website submissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-center">
            📝 Real-time data from database
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.total}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{stats.confirmed}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{stats.thisMonth}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Recent Bookings
          </h2>
        </div>
        
        {/* Desktop Table View - Hidden on tablets and mobile */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(bookings) && bookings.length > 0 ? bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                      {booking.customerName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                      {booking.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                      {booking.vehicle?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {booking.vehicle?.plateNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-[100px]">
                      {booking.service}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.startTime}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      SGD {booking.totalAmount?.toFixed(0) || '0'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus === 'PAID' ? '✓' : booking.paymentStatus === 'FAILED' ? '✗' : '⏳'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetailsModal(true)
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No bookings found. Bookings will appear here once customers make reservations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {Array.isArray(bookings) && bookings.length > 0 ? bookings.map((booking) => (
            <div key={booking.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {booking.customerName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {booking.customerEmail}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus === 'PAID' ? '✓ Paid' : booking.paymentStatus === 'FAILED' ? '✗ Failed' : '⏳ Pending'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {booking.vehicle?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Service:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {booking.service}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {booking.startTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    SGD {booking.totalAmount?.toFixed(0) || '0'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedBooking(booking)
                  setShowDetailsModal(true)
                }}
                className="w-full text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No bookings found. Bookings will appear here once customers make reservations.
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                Booking Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedBooking(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</p>
                  <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono break-all">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                    {selectedBooking.paymentStatus || 'PENDING'}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Service</p>
                  <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.service}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-all">{selectedBooking.customerEmail}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Phone</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.customerPhone}</p>
                      <a
                        href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium"
                        title="Chat on WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Vehicle Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.vehicle?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Plate Number</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.vehicle?.plateNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Trip Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                      {new Date(selectedBooking.startDate).toLocaleDateString()} at {selectedBooking.startTime}
                    </p>
                  </div>
                  {!selectedBooking.service.toUpperCase().includes('ONE') && 
                   !selectedBooking.service.toUpperCase().includes('AIRPORT') && 
                   !selectedBooking.service.toUpperCase().includes('TRANSFER') && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.duration}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Pickup Location</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.pickupLocation}</p>
                    {selectedBooking.pickupNote && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">📍 {selectedBooking.pickupNote}</p>
                    )}
                  </div>
                  {selectedBooking.dropoffLocation && (
                    <div className="sm:col-span-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Drop-off Location</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.dropoffLocation}</p>
                      {selectedBooking.dropoffNote && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">📍 {selectedBooking.dropoffNote}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">
                      SGD {selectedBooking.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  {selectedBooking.depositAmount && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Deposit Amount</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">
                        SGD {selectedBooking.depositAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {selectedBooking.stripeSessionId && (
                    <div className="sm:col-span-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Stripe Session ID</p>
                      <p className="text-xs text-gray-900 dark:text-white font-mono break-all">
                        {selectedBooking.stripeSessionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                  <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedBooking(null)
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
