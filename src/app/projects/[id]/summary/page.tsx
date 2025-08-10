'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectSummaryRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main projects page since we no longer use project IDs
    router.replace('/projects')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Redirecting to your knowledge base...
          </p>
        </div>
      </div>
    </div>
  )
}
