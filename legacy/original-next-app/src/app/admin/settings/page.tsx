'use client'

import { useState, useEffect } from 'react'
import { Settings, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from '@/components/admin/Icons'

interface AdminProfile {
  email: string
  name: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({ email: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success && data.data && data.data.user) {
        setAdminProfile({
          email: data.data.user.email || '',
          name: data.data.user.name || ''
        })
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: adminProfile.email,
          name: adminProfile.name
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update localStorage if email changed
        const userInfo = localStorage.getItem('admin-user')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          user.email = adminProfile.email
          user.name = adminProfile.name
          localStorage.setItem('admin-user', JSON.stringify(user))
        }
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Settings Menu
              </h2>
              <nav className="space-y-2">
                {[
                  { id: 'admin', name: 'Admin Profile', icon: Lock },
                  { id: 'general', name: 'General', icon: Settings },
                  { id: 'email', name: 'Email/SMTP', icon: Mail },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'admin' ? 'Admin Profile' : activeTab === 'email' ? 'Email/SMTP Settings' : 'General Settings'}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Message Alert */}
              {message && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Admin Profile Tab */}
              {activeTab === 'admin' && (
                <>
                  {/* Update Email & Name */}
                  <form onSubmit={handleProfileUpdate}>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                        Update Profile Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={adminProfile.name}
                            onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Admin Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={adminProfile.email}
                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                            placeholder="admin@zbkluxury.com"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This email will be used for login and notifications
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Update Password */}
                  <form onSubmit={handlePasswordUpdate} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Password must be at least 6 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Confirm new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {/* General Settings Tab */}
              {activeTab === 'general' && (
                <>
                  {/* Company Information */}
                  <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      defaultValue="ZBK Luxury Transport"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@zbkluxury.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+62 21 1234 5678"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      defaultValue="Jakarta, Indonesia"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* System Preferences */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  System Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive email notifications for new bookings
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-assign Vehicles
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically assign available vehicles to bookings
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maintenance Reminders
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Send reminders for vehicle maintenance schedules
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
                </>
              )}

              {/* Email/SMTP Settings Tab */}
              {activeTab === 'email' && (
                <>
                  {/* SMTP Configuration */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      SMTP Email Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          placeholder="smtp.gmail.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          placeholder="587"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username/Email
                        </label>
                        <input
                          type="email"
                          placeholder="your-email@gmail.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password/App Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enable TLS/SSL
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Use secure connection for email sending
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Send Booking Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically send email notifications for new bookings
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notification Recipients
                        </label>
                        <input
                          type="text"
                          placeholder="admin@zbkluxury.com, manager@zbkluxury.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Separate multiple emails with commas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Test Email Button */}
                  <div className="flex items-center space-x-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Test Email Configuration
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Send a test email to verify SMTP settings
                    </span>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
