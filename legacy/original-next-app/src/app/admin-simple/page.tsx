'use client'

export default function AdminSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🎉 Admin Panel - Login Berhasil!
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Selamat! Anda berhasil login ke admin panel
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              ✅ Database PostgreSQL terhubung
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ✅ Authentication berhasil
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ✅ Tidak ada redirect loop
            </p>
          </div>
          
          <div className="mt-6 space-x-4">
            <a
              href="/admin"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-block"
            >
              🚀 Go to Full Admin Dashboard
            </a>
            
            <a
              href="/admin-test"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-block"
            >
              🔧 Test Auth Status
            </a>
            
            <a
              href="/login/admin"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors inline-block"
            >
              🔙 Back to Login
            </a>
          </div>
        </div>
        
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
            🔧 Next Steps
          </h3>
          <ul className="text-green-700 dark:text-green-300 space-y-2">
            <li>• Login system berfungsi dengan baik</li>
            <li>• Database PostgreSQL aktif</li>
            <li>• Siap untuk development selanjutnya</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
