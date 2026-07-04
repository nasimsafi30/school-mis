import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-900'>404</h1>
        <h2 className='text-2xl font-semibold mt-4'>Page Not Found</h2>
        <p className='text-gray-600 mt-2'>The page you're looking for doesn't exist.</p>
        <Link href='/dashboard' className='mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
