import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { HostelClient } from './components/client'

export default async function HostelPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const hostels: any[] = await db.query.hostels.findMany()

  const totalCapacity = hostels.reduce((sum: number, h: any) => sum + (h.capacity || 0), 0)
  const totalOccupied = hostels.reduce((sum: number, h: any) => sum + (h.occupied || 0), 0)
  const boysHostels = hostels.filter((h: any) => h.type === 'boys').length
  const girlsHostels = hostels.filter((h: any) => h.type === 'girls').length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-8 text-white shadow-xl shadow-rose-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Hostel Management</h1>
            <p className='text-rose-200 mt-2'>Manage hostel facilities and student accommodation</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🏠</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{hostels.length}</p>
                  <p className='text-xs text-rose-200'>Total Hostels</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🛏️</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalCapacity}</p>
                  <p className='text-xs text-rose-200'>Total Capacity</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👤</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalOccupied}</p>
                  <p className='text-xs text-rose-200'>Occupied</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📊</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0}%</p>
                  <p className='text-xs text-rose-200'>Occupancy</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>🏠</div>
          </div>
        </div>
      </div>

      <HostelClient data={hostels} />
    </div>
  )
}