'use client'

import Link from 'next/link'

export default function AdminDirectPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Admin Access
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Login requirement telah dinonaktifkan. Klik tombol di bawah untuk akses admin dashboard.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/admin"
              className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              🎯 Go to Admin Dashboard
            </Link>
            
            <Link
              href="/admin-simple"
              className="block w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              ✅ Go to Simple Admin
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              🏠 Back to Website
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ AuthGuard dinonaktifkan<br/>
              ✅ Admin dashboard dapat diakses langsung<br/>
              ✅ Tidak perlu login
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
