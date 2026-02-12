'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-deep-slate mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-healing-teal text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/home"
            className="block w-full bg-white text-deep-slate px-6 py-3 rounded-lg font-medium border-2 border-deep-slate hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-sm text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
