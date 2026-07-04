import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { TransportClient } from './components/client'

export default async function TransportPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const routes: any[] = await db.query.transport.findMany()

  const totalCapacity = routes.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0)
  const totalOccupied = routes.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0)
  const activeRoutes = routes.length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-8 text-white shadow-xl shadow-sky-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Transport Management</h1>
            <p className='text-sky-200 mt-2'>Manage bus routes, vehicles, and driver assignments</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🚌</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{activeRoutes}</p>
                  <p className='text-xs text-sky-200'>Active Routes</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🪑</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalCapacity}</p>
                  <p className='text-xs text-sky-200'>Total Capacity</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👤</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalOccupied}</p>
                  <p className='text-xs text-sky-200'>Students</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📊</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0}%</p>
                  <p className='text-xs text-sky-200'>Occupancy</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>🚌</div>
          </div>
        </div>
      </div>

      <TransportClient data={routes} />
    </div>
  )
}