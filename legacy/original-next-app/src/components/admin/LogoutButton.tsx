'use client'

import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      console.log('Logout initiated...')
      
      // Clear all localStorage first
      localStorage.removeItem('auth-token')
      localStorage.removeItem('admin-user')
      localStorage.removeItem('zbk_user')
      localStorage.clear()
      
      // Call logout API to clear server-side cookie
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        })
      } catch (apiError) {
        console.error('Logout API error:', apiError)
        // Continue with redirect even if API fails
      }
      
      console.log('Logout successful, redirecting to homepage')
      
      // Force redirect to homepage with full page reload
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if everything fails, clear storage and redirect
      localStorage.removeItem('auth-token')
      localStorage.removeItem('admin-user')
      localStorage.removeItem('zbk_user')
      localStorage.clear()
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  )
}
