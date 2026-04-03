'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthRedirectProps {
  to: string
  delay?: number
}

export default function AuthRedirect({ to, delay = 100 }: AuthRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    const redirect = () => {
      console.log(`AuthRedirect: Redirecting to ${to}`)
      
      // Use window.location.href immediately for most reliable redirect
      window.location.href = to
    }

    // Immediate redirect without delay
    redirect()
  }, [to, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-blue-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to dashboard...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  )
}
