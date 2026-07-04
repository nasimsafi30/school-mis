import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ExamsClient } from './components/client'

export default async function ExamsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const examsData = await db.query.exams.findMany({
    orderBy: (exams: any, { desc }: any) => [desc(exams.date)],
    with: { class: true, subject: true },
  })

  const classes = await db.query.classes.findMany()
  const subjects = await db.query.subjects.findMany({ with: { class: true } })

  const upcomingExams = examsData.filter((e: any) => e.status === 'upcoming').length
  const completedExams = examsData.filter((e: any) => e.status === 'completed').length
  const todayExams = examsData.filter((e: any) => new Date(e.date).toDateString() === new Date().toDateString()).length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white shadow-xl shadow-rose-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Examinations</h1>
            <p className='text-rose-200 mt-2'>Schedule and manage all school examinations</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📝</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{examsData.length}</p>
                  <p className='text-xs text-rose-200'>Total Exams</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{upcomingExams}</p>
                  <p className='text-xs text-rose-200'>Upcoming</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>✅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{completedExams}</p>
                  <p className='text-xs text-rose-200'>Completed</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🔴</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{todayExams}</p>
                  <p className='text-xs text-rose-200'>Today</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📝</div>
          </div>
        </div>
      </div>

      <ExamsClient data={examsData} classes={classes} subjects={subjects} />
    </div>
  )
}