'use client'

import { useState, useEffect } from 'react'

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get token from localStorage as fallback
      const token = localStorage.getItem('auth-token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Ensure cookies are sent
        headers
      })
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      setAuthStatus({ success: false, error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@zbkluxury.com',
          password: 'ZBKAdmin2024!'
        })
      })
      const data = await response.json()
      console.log('Login test result:', data)
      
      // Recheck auth after login
      setTimeout(() => {
        checkAuth()
      }, 500)
    } catch (error) {
      console.error('Login test error:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Auth Status:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          
          <button
            onClick={checkAuth}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check Auth
          </button>
          
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Admin
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Login" to login via API</li>
            <li>Check console for debug logs</li>
            <li>Click "Check Auth" to verify authentication</li>
            <li>Click "Go to Admin" to test redirect</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
