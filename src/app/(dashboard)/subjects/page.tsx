import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { SubjectsClient } from './components/client'

export default async function SubjectsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const subjectsData = await db.query.subjects.findMany({
    orderBy: (subjects: any, { asc }: any) => [asc(subjects.name)],
    with: { class: true, teacher: true },
  })

  const classes = await db.query.classes.findMany()
  const teachers = await db.query.teachers.findMany()

  const mandatorySubjects = subjectsData.filter((s: any) => !s.isOptional).length
  const optionalSubjects = subjectsData.filter((s: any) => s.isOptional).length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 p-8 text-white shadow-xl shadow-cyan-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Subjects & Curriculum</h1>
            <p className='text-cyan-200 mt-2'>Manage academic subjects, assignments, and curriculum</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📚</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{subjectsData.length}</p>
                  <p className='text-xs text-cyan-200'>Total Subjects</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📖</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{mandatorySubjects}</p>
                  <p className='text-xs text-cyan-200'>Mandatory</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📝</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{optionalSubjects}</p>
                  <p className='text-xs text-cyan-200'>Optional</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📚</div>
          </div>
        </div>
      </div>

      <SubjectsClient data={subjectsData} classes={classes} teachers={teachers} />
    </div>
  )
}