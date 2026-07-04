import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layouts/sidebar'
import { Header } from '@/components/layouts/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className='h-full relative'>
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <div className='hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40'>
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className='md:pl-72'>
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <div className='p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen'>
          {children}
        </div>
      </main>
    </div>
  )
}