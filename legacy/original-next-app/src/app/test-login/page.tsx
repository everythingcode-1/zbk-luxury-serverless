'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(`API Test: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`API Test Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testSetupAdmin = async () => {
    setLoading(true)
    try {
      // First check if admin exists
      const checkResponse = await fetch('/api/auth/setup-admin')
      const checkData = await checkResponse.json()
      setResult(`Setup Check: ${JSON.stringify(checkData, null, 2)}`)

      if (!checkData.adminExists) {
        // Create admin
        const setupResponse = await fetch('/api/auth/setup-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        const setupData = await setupResponse.json()
        setResult(prev => prev + `\n\nSetup Result: ${JSON.stringify(setupData, null, 2)}`)
      }
    } catch (error) {
      setResult(`Setup Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@zbkluxury.com',
          password: 'ZBKAdmin2024!'
        })
      })
      const data = await response.json()
      setResult(`Login Test: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Login Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-navy p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h2 font-bold text-white mb-8">Login Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-luxury-gold text-deep-navy px-6 py-3 rounded-compact font-medium hover:bg-luxury-gold-hover disabled:opacity-50"
          >
            Test API Connection
          </button>
          
          <button
            onClick={testSetupAdmin}
            disabled={loading}
            className="bg-info-blue text-white px-6 py-3 rounded-compact font-medium hover:bg-blue-600 disabled:opacity-50 ml-4"
          >
            Test Setup Admin
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-success-green text-white px-6 py-3 rounded-compact font-medium hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            Test Login
          </button>
        </div>

        {loading && (
          <div className="text-luxury-gold mb-4">
            Testing...
          </div>
        )}

        {result && (
          <div className="bg-charcoal p-6 rounded-standard">
            <h2 className="text-white font-medium mb-4">Result:</h2>
            <pre className="text-white/80 text-sm overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
