import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Board Not Found</h1>
        <p className="text-gray-600 mb-8">
          The board you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}