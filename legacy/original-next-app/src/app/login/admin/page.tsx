'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, AlertCircle } from 'lucide-react'
import AuthRedirect from '@/components/auth/AuthRedirect'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const router = useRouter()

  // Check if admin setup is needed
  useEffect(() => {
    checkAdminSetup()
  }, [])

  const checkAdminSetup = async () => {
    try {
      const response = await fetch('/api/auth/setup-admin')
      const data = await response.json()
      if (data.success && !data.adminExists) {
        setSetupNeeded(true)
      }
    } catch (error) {
      console.error('Error checking admin setup:', error)
    }
  }

  const setupAdmin = async () => {
    setSetupLoading(true)
    console.log('🔧 Starting admin setup...')
    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('📡 Setup response status:', response.status)
      const data = await response.json()
      console.log('📦 Setup response data:', data)
      
      if (data.success) {
        console.log('✅ Admin setup successful!')
        setSetupNeeded(false)
        setError('')
        // Auto-fill with default credentials
        setFormData({
          email: 'admin@zbkluxury.com',
          password: 'ZBKAdmin2024!'
        })
        console.log('📝 Form auto-filled with credentials')
      } else {
        console.log('❌ Setup failed:', data.message)
        setError(data.message || 'Failed to setup admin')
      }
    } catch (error) {
      console.error('💥 Setup error:', error)
      setError('Network error during setup')
    } finally {
      setSetupLoading(false)
      console.log('🏁 Setup process finished')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log('🚀 Login button clicked!')
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setLoading(true)
    setError('')

    console.log('🔄 Starting login process...')
    console.log('📧 Form data:', formData)
    
    // Validate form data
    if (!formData.email || !formData.password) {
      console.log('❌ Form validation failed')
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      console.log('🌐 Sending request to /api/auth/login')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      const data = await response.json()
      console.log('📦 Response data:', data)

      if (data.success) {
        console.log('✅ Login successful!')
        localStorage.setItem('admin-user', JSON.stringify(data.data.user))
        localStorage.setItem('auth-token', data.data.token)
        console.log('💾 Data stored in localStorage')
        
        // Debug and try multiple navigation methods
        console.log('🔄 Redirecting with multiple methods...')
        console.log('🔍 Router object:', router)
        
        // Method 1: Immediate router.push
        try {
          console.log('📍 Method 1: Immediate router.push(/admin)')
          const result = router.push('/admin')
          console.log('📍 Router.push result:', result)
        } catch (error) {
          console.error('❌ Router.push error:', error)
        }
        
        // Method 2: Router.replace
        setTimeout(() => {
          try {
            console.log('📍 Method 2: router.replace(/admin)')
            router.replace('/admin')
          } catch (error) {
            console.error('❌ Router.replace error:', error)
          }
        }, 200)
        
        // Method 3: Window.location as fallback
        setTimeout(() => {
          console.log('📍 Method 3: window.location.href fallback')
          window.location.href = '/admin'
        }, 500)
        
        return
      } else {
        console.log('❌ Login failed:', data.message)
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('💥 Login error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      console.log('🏁 Login process finished')
    }
  }

  // No need for AuthRedirect component anymore - using direct redirect

  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-white/70 hover:text-luxury-gold transition-colors duration-standard group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-standard" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-gold rounded-standard mb-6">
              <Shield className="h-8 w-8 text-deep-navy" />
            </div>
            <h1 className="text-h2 font-bold text-white mb-2">
              Admin Login
            </h1>
            <p className="text-white/70">
              ZBK Luxury Transport
            </p>
          </div>

          {/* Setup Admin Notice */}
          {setupNeeded && (
            <div className="mb-6 p-4 bg-luxury-gold/10 border border-luxury-gold/30 rounded-standard">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-5 w-5 text-luxury-gold mr-2" />
                <p className="text-sm font-medium text-luxury-gold">Setup Required</p>
              </div>
              <p className="text-sm text-white/70 mb-3">
                No admin users found. Click below to create default admin accounts.
              </p>
              <button
                onClick={setupAdmin}
                disabled={setupLoading}
                className="w-full bg-luxury-gold text-deep-navy font-medium py-2 px-4 rounded-compact hover:bg-luxury-gold-hover transition-colors duration-standard disabled:opacity-50"
              >
                {setupLoading ? 'Setting up...' : 'Setup Admin Accounts'}
              </button>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-charcoal rounded-standard p-6 border border-light-gray/20">
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-light-gray border border-light-gray/50 rounded-compact text-white placeholder-white/50 focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors duration-standard"
                    placeholder="admin@zbkluxury.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-light-gray border border-light-gray/50 rounded-compact text-white placeholder-white/50 focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors duration-standard"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-standard" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-standard" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-alert-red/10 border border-alert-red/30 rounded-compact p-3">
                  <p className="text-sm text-alert-red flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-luxury-gold text-deep-navy font-medium py-3 px-4 rounded-compact hover:bg-luxury-gold-hover transition-colors duration-standard disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-deep-navy mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-deep-navy/50 rounded-compact border border-light-gray/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-white/70">Demo Credentials</p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        email: 'admin@zbkluxury.com',
                        password: 'ZBKAdmin2024!'
                      })
                    }}
                    className="text-xs text-luxury-gold hover:text-luxury-gold-hover font-medium transition-colors duration-standard"
                  >
                    Auto Fill
                  </button>
                  <button
                    type="button"
                    onClick={setupAdmin}
                    disabled={setupLoading}
                    className="text-xs text-info-blue hover:text-blue-400 font-medium transition-colors duration-standard disabled:opacity-50"
                  >
                    {setupLoading ? 'Setting up...' : 'Setup Admin'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔄 Manual navigation test...')
                      console.log('🔍 Current pathname:', window.location.pathname)
                      console.log('🔍 Router object:', router)
                      
                      try {
                        console.log('📍 Trying router.push(/admin)')
                        const result = router.push('/admin')
                        console.log('📍 Router result:', result)
                        
                        // Fallback after 1 second
                        setTimeout(() => {
                          console.log('📍 Fallback: window.location.href')
                          window.location.href = '/admin'
                        }, 1000)
                      } catch (error) {
                        console.error('❌ Manual router error:', error)
                        window.location.href = '/admin'
                      }
                    }}
                    className="text-xs text-success-green hover:text-green-400 font-medium transition-colors duration-standard"
                  >
                    Go to Admin (Debug)
                  </button>
                  
                  <Link
                    href="/admin"
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors duration-standard"
                  >
                    Link to Admin
                  </Link>
                  
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔄 Direct window.location redirect')
                      window.location.href = '/admin'
                    }}
                    className="text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-standard"
                  >
                    Direct Redirect
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-white/50">
                <p><span className="text-white/70">Email:</span> admin@zbkluxury.com</p>
                <p><span className="text-white/70">Password:</span> ZBKAdmin2024!</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-white/50">
              © 2024 ZBK Luxury Transport
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
