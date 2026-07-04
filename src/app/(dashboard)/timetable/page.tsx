import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { TimetableClient } from './components/client'

export default async function TimetablePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [timetable, classes, subjects, teachers] = await Promise.all([
    db.query.timetable.findMany({
      with: { class: true, section: true, subject: true, teacher: true },
      orderBy: (timetable: any, { asc }: any) => [asc(timetable.dayOfWeek), asc(timetable.startTime)],
    }),
    db.query.classes.findMany({
      with: { sections: true },
      orderBy: (classes: any, { asc }: any) => [asc(classes.numericName)],
    }),
    db.query.subjects.findMany({
      with: { class: true },
    }),
    db.query.teachers.findMany(),
  ])

  const totalPeriods = timetable.length
  const totalSubjects = subjects.length
  const totalTeachers = teachers.length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-8 text-white shadow-xl shadow-indigo-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Timetable</h1>
            <p className='text-indigo-200 mt-2'>Manage class schedules, periods, and room assignments</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🕐</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalPeriods}</p>
                  <p className='text-xs text-indigo-200'>Total Periods</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📚</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{classes.length}</p>
                  <p className='text-xs text-indigo-200'>Classes</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📖</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalSubjects}</p>
                  <p className='text-xs text-indigo-200'>Subjects</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👨‍🏫</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalTeachers}</p>
                  <p className='text-xs text-indigo-200'>Teachers</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>🕐</div>
          </div>
        </div>
      </div>

      <TimetableClient
        timetable={timetable || []}
        classes={classes || []}
        subjects={subjects || []}
        teachers={teachers || []}
      />
    </div>
  )
}