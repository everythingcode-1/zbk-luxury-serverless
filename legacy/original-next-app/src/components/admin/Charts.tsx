'use client'

import { BarChart3, CheckCircle, XCircle } from '@/components/admin/Icons'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface LineChartProps {
  data: Array<{ month: string; bookings: number; revenue: number }>
  title: string
}

interface BarChartProps {
  data: ChartData[]
  title: string
  type?: 'horizontal' | 'vertical'
}

interface DonutChartProps {
  data: ChartData[]
  title: string
  total?: number
}

// Simple Line Chart Component
export function LineChart({ data, title }: LineChartProps) {
  const maxBookings = Math.max(...data.map(d => d.bookings))
  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <CheckCircle className="h-5 w-5 text-green-500" />
      </div>
      
      <div className="space-y-4">
        {/* Booking Trend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookings</span>
            <span className="text-sm text-blue-600">{data[data.length - 1]?.bookings} this month</span>
          </div>
          <div className="flex items-end space-x-1 h-20">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.bookings / maxBookings) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {item.month.split('-')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue (SGD)</span>
            <span className="text-sm text-green-600">
              SGD {(data[data.length - 1]?.revenue / 1000).toFixed(0)}K this month
            </span>
          </div>
          <div className="flex items-end space-x-1 h-20">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {item.month.split('-')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Bar Chart Component
export function BarChart({ data, title, type = 'vertical' }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <BarChart3 className="h-5 w-5 text-blue-500" />
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400 capitalize">
              {item.label.replace('_', ' ')}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color || 'bg-blue-500'}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Donut Chart Component
export function DonutChart({ data, title, total }: DonutChartProps) {
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-indigo-500'
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="flex items-center space-x-6">
        {/* Simple circular progress representation */}
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {totalValue}
            </span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / totalValue) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {item.label.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: string
}

export function MetricCard({ title, value, change, icon, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' && value > 1000000 
              ? `${(value / 1000000).toFixed(1)}M`
              : value
            }
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
