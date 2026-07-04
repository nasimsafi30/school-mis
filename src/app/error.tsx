'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-red-600'>Something went wrong!</h1>
        <p className='text-gray-600 mt-2'>{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className='mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
