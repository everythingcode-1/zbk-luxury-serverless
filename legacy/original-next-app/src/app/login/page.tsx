'use client'

import Link from 'next/link'
import { Shield, Users, ArrowRight, ArrowLeft } from 'lucide-react'

export default function LoginPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-blue-600/20"></div>
      </div>
      
      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-200 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl mb-8 shadow-2xl">
              <Shield className="h-12 w-12 text-slate-900" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Login Portal
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose your access level to continue to ZBK Luxury Transport platform
            </p>
          </div>

          {/* Login Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Admin Login */}
            <Link href="/login/admin">
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Admin Access
                </h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Full system access for administrators. Manage vehicles, bookings, users, and system settings.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-400 group-hover:text-red-300 transition-colors duration-200">
                    <span className="text-sm font-semibold">Admin Portal</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </Link>

            {/* Customer Portal (Future) */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 opacity-60">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl mb-6">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                Customer Portal
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Customer dashboard for booking history, preferences, and account management.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="text-sm font-semibold">Coming Soon</span>
                </div>
                <div className="px-3 py-1 bg-slate-700/50 rounded-full">
                  <span className="text-xs text-slate-400 font-medium">Future Release</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Access</h3>
                <p className="text-slate-400 text-sm">Advanced security with JWT authentication and role-based access control.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
                <p className="text-slate-400 text-sm">Comprehensive user and role management system for different access levels.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Easy Navigation</h3>
                <p className="text-slate-400 text-sm">Intuitive interface design for seamless user experience across all platforms.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-slate-400 text-sm">
              © 2024 ZBK Luxury Transport. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Secure authentication portal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
