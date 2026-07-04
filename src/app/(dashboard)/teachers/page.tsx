import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { TeachersClient } from './components/client'

export default async function TeachersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const teachersData = await db.query.teachers.findMany({
    orderBy: (teachers: any, { desc }: any) => [desc(teachers.createdAt)],
    with: { department: true },
  })

  const departments = await db.query.departments.findMany()

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 text-white shadow-xl shadow-violet-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Teachers Directory</h1>
            <p className='text-violet-200 mt-2'>Manage faculty members, assignments, and departments</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>👨‍🏫</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{teachersData.length}</p>
                  <p className='text-xs text-violet-200'>Total Teachers</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🏢</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{departments.length}</p>
                  <p className='text-xs text-violet-200'>Departments</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>👨‍🏫</div>
          </div>
        </div>
      </div>

      <TeachersClient data={teachersData} departments={departments} />
    </div>
  )
}