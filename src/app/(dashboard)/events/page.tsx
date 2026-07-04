import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { EventsClient } from './components/client'

export default async function EventsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const events: any[] = await db.query.events.findMany({
    orderBy: (events: any, { asc }: any) => [asc(events.startDate)],
  })

  const upcomingEvents = events.filter((e: any) => e.status === 'upcoming').length
  const ongoingEvents = events.filter((e: any) => e.status === 'ongoing').length
  const completedEvents = events.filter((e: any) => e.status === 'completed').length
  const todayEvents = events.filter((e: any) => {
    const today = new Date()
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    return today >= start && today <= end
  }).length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-8 text-white shadow-xl shadow-fuchsia-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Events & Activities</h1>
            <p className='text-fuchsia-200 mt-2'>Manage school events, celebrations, and activities</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{events.length}</p>
                  <p className='text-xs text-fuchsia-200'>Total Events</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📌</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{upcomingEvents}</p>
                  <p className='text-xs text-fuchsia-200'>Upcoming</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🔄</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{ongoingEvents}</p>
                  <p className='text-xs text-fuchsia-200'>Ongoing</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🔴</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{todayEvents}</p>
                  <p className='text-xs text-fuchsia-200'>Today</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>🎉</div>
          </div>
        </div>
      </div>

      <EventsClient data={events} />
    </div>
  )
}