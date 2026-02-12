import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-deep-slate mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/home"
            className="block w-full bg-healing-teal text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            Go to Home
          </Link>
          
          <Link
            href="/contact"
            className="block w-full bg-white text-deep-slate px-6 py-3 rounded-lg font-medium border-2 border-deep-slate hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Visit our:</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/features" className="text-healing-teal hover:underline">
              Features
            </Link>
            <Link href="/pricing" className="text-healing-teal hover:underline">
              Pricing
            </Link>
            <Link href="/about" className="text-healing-teal hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
