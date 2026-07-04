import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from './components/client'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white shadow-xl shadow-blue-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Settings</h1>
            <p className='text-blue-200 mt-2'>Manage your account settings and preferences</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👤</span>
                </div>
                <div>
                  <p className='text-sm text-blue-200'>Account Type</p>
                  <p className='text-lg font-bold capitalize'>{session.user?.role || 'User'}</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📧</span>
                </div>
                <div>
                  <p className='text-sm text-blue-200'>Email</p>
                  <p className='text-lg font-bold truncate max-w-[200px]'>{session.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>⚙️</div>
          </div>
        </div>
      </div>

      <SettingsClient user={session.user} />
    </div>
  )
}