import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StudentsClient } from './components/client'

export default async function StudentsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  let studentsData: any[] = []
  let classesData: any[] = []
  let sectionsData: any[] = []

  try {
    studentsData = await db.query.students.findMany({
      orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
    })
    classesData = await db.query.classes.findMany()
    sectionsData = await db.query.sections.findMany()
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  const totalStudents = studentsData.length
  const activeStudents = studentsData.filter((s: any) => s.admissionStatus === 'enrolled').length
  const newAdmissions = studentsData.filter((s: any) => {
    const admissionDate = new Date(s.admissionDate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return admissionDate >= thirtyDaysAgo
  }).length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-8 text-white shadow-xl shadow-violet-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Students Management</h1>
            <p className='text-violet-200 mt-2'>Manage all student records, admissions, and information</p>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>👨‍🎓</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-blue-100'>Total Students</p>
              <div className='p-2 bg-white/20 rounded-xl'>👨‍🎓</div>
            </div>
            <p className='text-3xl font-bold mt-3'>{totalStudents}</p>
            <p className='text-xs text-blue-200 mt-1'>All registered students</p>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg shadow-emerald-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-emerald-100'>Active Students</p>
              <div className='p-2 bg-white/20 rounded-xl'>✅</div>
            </div>
            <p className='text-3xl font-bold mt-3'>{activeStudents}</p>
            <p className='text-xs text-emerald-200 mt-1'>Currently enrolled</p>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white shadow-lg shadow-purple-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-purple-100'>New Admissions</p>
              <div className='p-2 bg-white/20 rounded-xl'>🆕</div>
            </div>
            <p className='text-3xl font-bold mt-3'>{newAdmissions}</p>
            <p className='text-xs text-purple-200 mt-1'>Last 30 days</p>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg shadow-amber-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-amber-100'>Growth Rate</p>
              <div className='p-2 bg-white/20 rounded-xl'>📈</div>
            </div>
            <p className='text-3xl font-bold mt-3'>12%</p>
            <p className='text-xs text-amber-200 mt-1'>Year over year</p>
          </div>
        </div>
      </div>

      <StudentsClient data={studentsData} classes={classesData} sections={sectionsData} />
    </div>
  )
}