'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-2xl mb-4">🔄</div>
        <p>Redirecionando para o Dashboard...</p>
      </div>
    </div>
  )
}