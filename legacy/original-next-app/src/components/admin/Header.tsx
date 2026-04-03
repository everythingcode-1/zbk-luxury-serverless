'use client'

import { useRouter } from 'next/navigation'
import { Menu, Lock } from './Icons'
import { useSidebar } from '@/contexts/SidebarContext'

export default function Header() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      })
      
      // Clear all localStorage items
      localStorage.removeItem('admin-user')
      localStorage.removeItem('auth-token')
      
      // Clear all localStorage for complete cleanup
      localStorage.clear()
      
      console.log('Logout successful, redirecting to homepage')
      
      // Force redirect to homepage
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API fails, clear local storage and redirect
      localStorage.clear()
      window.location.href = '/'
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Right side - Logout button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
