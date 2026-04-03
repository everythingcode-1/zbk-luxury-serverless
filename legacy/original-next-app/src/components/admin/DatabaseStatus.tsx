'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Settings, BarChart3 } from '@/components/admin/Icons'

interface SystemStatus {
  timestamp: string
  server: string
  database: string
  apis: {
    vehicles: string
    bookings: string
    blog: string
    settings: string
  }
  features: {
    vehicle_crud: boolean
    booking_management: boolean
    blog_management: boolean
    image_upload: boolean
    email_notifications: boolean
  }
  setup_required: string[]
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getApiStatusColor = (apiStatus: string) => {
    switch (apiStatus) {
      case 'database': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'database_empty': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'mock_data': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getApiStatusText = (apiStatus: string) => {
    switch (apiStatus) {
      case 'database': return 'Database Connected'
      case 'database_empty': return 'Database (Empty)'
      case 'mock_data': return 'Mock Data'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span>Failed to load system status</span>
        </div>
      </div>
    )
  }

  const isConnected = status.database === 'connected'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>System Status</span>
        </h3>
        <button
          onClick={fetchStatus}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Refresh
        </button>
      </div>

      {/* Main Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Server</p>
            <p className="text-sm text-green-600 capitalize">{status.server}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusIcon(isConnected)}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
            <p className={`text-sm capitalize ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {status.database}
            </p>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">API Endpoints</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(status.apis).map(([api, apiStatus]) => (
            <div key={api} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {api.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getApiStatusColor(apiStatus)}`}>
                {getApiStatusText(apiStatus)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Features</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(status.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {feature.replace('_', ' ')}
              </span>
              {getStatusIcon(enabled)}
            </div>
          ))}
        </div>
      </div>

      {/* Setup Required */}
      {status.setup_required.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span>Setup Required</span>
          </h4>
          <ul className="space-y-1">
            {status.setup_required.map((item, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Database Setup Link */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Dashboard is running with mock data. 
            See <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">DATABASE_SETUP.md</code> for setup instructions.
          </p>
        </div>
      )}
    </div>
  )
}
