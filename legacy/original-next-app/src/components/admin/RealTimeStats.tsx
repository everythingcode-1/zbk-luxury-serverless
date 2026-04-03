'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, Clock, DollarSign, AlertCircle } from '@/components/admin/Icons'

interface RealTimeData {
  activeBookings: number
  todayRevenue: number
  pendingApprovals: number
  systemStatus: 'online' | 'maintenance' | 'offline'
  lastUpdate: string
}

export default function RealTimeStats() {
  const [stats, setStats] = useState<RealTimeData>({
    activeBookings: 0,
    todayRevenue: 0,
    pendingApprovals: 0,
    systemStatus: 'online',
    lastUpdate: new Date().toISOString()
  })

  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRealTimeStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/realtime-stats')
      const data = await response.json()
      
      if (data.success) {
        setStats({
          activeBookings: data.data.activeBookings || 0,
          todayRevenue: data.data.todayRevenue || 0,
          pendingApprovals: data.data.pendingApprovals || 0,
          systemStatus: data.data.systemStatus || 'online',
          lastUpdate: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error fetching real-time stats:', error)
      setStats(prev => ({
        ...prev,
        systemStatus: 'offline'
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch initial data
    fetchRealTimeStats()

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up interval for real-time updates
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchRealTimeStats()
      }, 10000) // Update every 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isLive, fetchRealTimeStats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500'
      case 'maintenance': return 'text-yellow-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />
      case 'maintenance': return <Clock className="h-4 w-4" />
      case 'offline': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Stats</h3>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getStatusColor(stats.systemStatus)}`}>
            {getStatusIcon(stats.systemStatus)}
            <span className="text-sm capitalize">{stats.systemStatus}</span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-2 py-1 rounded ${
              isLive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.activeBookings}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Active Bookings</div>
        </div>

        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.todayRevenue)}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Today's Revenue</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pendingApprovals}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Approvals</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date(stats.lastUpdate).toLocaleTimeString('id-ID')}
      </div>
    </div>
  )
}
