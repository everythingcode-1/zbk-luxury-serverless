'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Home, Car, Calendar, FileText, BarChart3, Settings, X, Type } from './Icons'
import { useSidebar } from '@/contexts/SidebarContext'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Hero Section', href: '/admin/hero-section', icon: Type },
  { name: 'Analysis', href: '/admin/analysis', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, closeSidebar } = useSidebar()

  const isActive = (path: string) => path === pathname

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ZBK Admin</span>
          </Link>
          
          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isItemActive = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isItemActive 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200"
          >
            <Home className="mr-3 h-5 w-5 flex-shrink-0" />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  )
}
