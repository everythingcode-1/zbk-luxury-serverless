'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Car, Calendar, DollarSign, Users, CheckCircle, XCircle, AlertCircle } from '@/components/admin/Icons'
import { LineChart, BarChart, DonutChart, MetricCard } from '@/components/admin/Charts'
import RealTimeStats from '@/components/admin/RealTimeStats'

interface AnalyticsData {
  overview: {
    totalVehicles: number
    totalBookings: number
    totalRevenue: number
    monthlyRevenue: number
  }
  vehicleStats: Array<{ status: string; count: number }>
  bookingStats: Array<{ status: string; count: number }>
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>
  popularVehicles: Array<{ name: string; model: string; bookings: number }>
  performance: {
    averageBookingValue: number
    completionRate: number
    utilizationRate: number
  }
}

export default function AnalysisPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-500'
      case 'in_use': return 'bg-blue-500'
      case 'maintenance': return 'bg-red-500'
      case 'completed': return 'bg-green-500'
      case 'confirmed': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Performance</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your business performance and insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics & Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your business performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Vehicles"
          value={analytics.overview.totalVehicles}
          icon={<Car className="h-6 w-6 text-white" />}
          color="blue"
          change={8.2}
        />
        <MetricCard
          title="Total Bookings"
          value={analytics.overview.totalBookings}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="green"
          change={12.5}
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(analytics.overview.monthlyRevenue)}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="yellow"
          change={-2.1}
        />
        <MetricCard
          title="Completion Rate"
          value={`${analytics.performance.completionRate}%`}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="purple"
          change={5.3}
        />
      </div>

      {/* Real-Time Stats */}
      <RealTimeStats />

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Booking Value</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analytics.performance.averageBookingValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Vehicle Utilization</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics.performance.utilizationRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analytics.overview.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Vehicles</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics.vehicleStats.find(s => s.status === 'AVAILABLE')?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics.bookingStats.find(s => s.status === 'CONFIRMED')?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics.bookingStats.find(s => s.status === 'PENDING')?.count || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Vehicle</h3>
          {analytics.popularVehicles[0] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {analytics.popularVehicles[0].name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analytics.popularVehicles[0].model}
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {analytics.popularVehicles[0].bookings} bookings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <LineChart
          data={analytics.monthlyTrends}
          title="Monthly Trends"
        />

        {/* Vehicle Status Distribution */}
        <DonutChart
          data={analytics.vehicleStats.map(stat => ({
            label: stat.status,
            value: stat.count,
            color: getStatusColor(stat.status)
          }))}
          title="Vehicle Status Distribution"
          total={analytics.overview.totalVehicles}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status */}
        <BarChart
          data={analytics.bookingStats.map(stat => ({
            label: stat.status,
            value: stat.count,
            color: getStatusColor(stat.status)
          }))}
          title="Booking Status Overview"
        />

        {/* Popular Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Vehicles</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {analytics.popularVehicles.slice(0, 5).map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {vehicle.model}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {vehicle.bookings}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
