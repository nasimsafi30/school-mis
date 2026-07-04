import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ResultsClient } from './components/client'

export default async function ResultsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const results: any[] = await db.query.results.findMany({
    orderBy: (results: any, { desc }: any) => [desc(results.createdAt)],
    with: { student: { with: { class: true, section: true } }, exam: { with: { subject: true } }, subject: true },
  })

  const exams: any[] = await db.query.exams.findMany({
    orderBy: (exams: any, { desc }: any) => [desc(exams.date)],
    with: { subject: true, class: true },
  })

  const students: any[] = await db.query.students.findMany({
    orderBy: (students: any, { asc }: any) => [asc(students.firstName)],
    with: { class: true, section: true },
  })

  const passCount = results.filter((r: any) => {
    const marks = Number(r.marksObtained)
    const passMarks = r.exam?.passingMarks || 40
    return marks >= passMarks
  }).length
  
  const failCount = results.length - passCount
  const avgPercentage = results.length > 0 
    ? (results.reduce((sum: number, r: any) => sum + ((Number(r.marksObtained) / (r.exam?.totalMarks || 100)) * 100), 0) / results.length).toFixed(1)
    : '0'

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-8 text-white shadow-xl shadow-amber-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Examination Results</h1>
            <p className='text-amber-200 mt-2'>View and analyze student performance across all exams</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📊</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{results.length}</p>
                  <p className='text-xs text-amber-200'>Total Results</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🏆</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{avgPercentage}%</p>
                  <p className='text-xs text-amber-200'>Average Score</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>✅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{passCount}</p>
                  <p className='text-xs text-amber-200'>Passed</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>❌</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{failCount}</p>
                  <p className='text-xs text-amber-200'>Failed</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📊</div>
          </div>
        </div>
      </div>

      <ResultsClient data={results} exams={exams} students={students} />
    </div>
  )
}