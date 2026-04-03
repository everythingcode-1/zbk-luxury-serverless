'use client'

import { useState, useEffect } from 'react'

export default function AdminTestPage() {
  const [authData, setAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkLocalStorage = () => {
    const token = localStorage.getItem('auth-token')
    const user = localStorage.getItem('admin-user')
    
    console.log('🔍 Checking localStorage...')
    console.log('Token:', token)
    console.log('User:', user)
    
    setAuthData({
      token: token || 'Not found',
      user: user ? JSON.parse(user) : 'Not found'
    })
  }

  const testAuthAPI = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth-token')
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('Auth API Response:', data)
      
      setAuthData((prev: any) => ({
        ...prev,
        apiResponse: data,
        apiStatus: response.status
      }))
    } catch (error) {
      console.error('Auth API Error:', error)
      setAuthData((prev: any) => ({
        ...prev,
        apiError: error instanceof Error ? error.message : 'Unknown error'
      }))
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = () => {
    localStorage.clear()
    setAuthData(null)
    console.log('🧹 Cleared localStorage')
  }

  useEffect(() => {
    checkLocalStorage()
  }, [])

  return (
    <div className="min-h-screen bg-deep-navy p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h2 font-bold text-white mb-8">Admin Test Page (No AuthGuard)</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={checkLocalStorage}
            className="bg-luxury-gold text-deep-navy px-6 py-3 rounded-compact font-medium hover:bg-luxury-gold-hover"
          >
            Check localStorage
          </button>
          
          <button
            onClick={testAuthAPI}
            disabled={loading}
            className="bg-info-blue text-white px-6 py-3 rounded-compact font-medium hover:bg-blue-600 disabled:opacity-50 ml-4"
          >
            Test Auth API
          </button>
          
          <button
            onClick={clearAuth}
            className="bg-alert-red text-white px-6 py-3 rounded-compact font-medium hover:bg-red-600 ml-4"
          >
            Clear Auth
          </button>
          
          <a
            href="/login/admin"
            className="bg-success-green text-white px-6 py-3 rounded-compact font-medium hover:bg-green-600 ml-4 inline-block"
          >
            Go to Login
          </a>
        </div>

        {authData && (
          <div className="bg-charcoal p-6 rounded-standard">
            <h2 className="text-white font-medium mb-4">Auth Data:</h2>
            <pre className="text-white/80 text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(authData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
