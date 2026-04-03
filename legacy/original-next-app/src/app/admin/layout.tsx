import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import { SidebarProvider } from '@/contexts/SidebarContext'
import AuthGuard from '@/components/auth/AuthGuard'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: 'ZBK Admin Dashboard',
  description: 'Admin dashboard for ZBK Luxury Transport',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard redirectTo="/">
      <SidebarProvider>
        <div className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="lg:ml-64">
            {/* Header */}
            <Header />
            
            {/* Page Content */}
            <main className="p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
