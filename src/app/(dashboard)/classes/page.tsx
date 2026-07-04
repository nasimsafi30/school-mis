import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ClassesClient } from './components/client'

export default async function ClassesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const classes: any[] = await db.query.classes.findMany({
    orderBy: (classes: any, { asc }: any) => [asc(classes.numericName)],
    with: { sections: true },
  })

  const totalStudents = classes.reduce((sum: number, c: any) => sum + (c.students?.length || 0), 0)
  const totalSections = classes.reduce((sum: number, c: any) => sum + (c.sections?.length || 0), 0)

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white shadow-xl shadow-orange-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Classes & Sections</h1>
            <p className='text-orange-200 mt-2'>Manage academic classes, sections, and student allocation</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📚</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{classes.length}</p>
                  <p className='text-xs text-orange-200'>Classes</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📖</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalSections}</p>
                  <p className='text-xs text-orange-200'>Sections</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👨‍🎓</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{totalStudents}</p>
                  <p className='text-xs text-orange-200'>Students</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📚</div>
          </div>
        </div>
      </div>

      <ClassesClient data={classes} />
    </div>
  )
}