import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { FeesClient } from './components/client'

export default async function FeesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const feesData = await db.query.fees.findMany({
    orderBy: (fees: any, { desc }: any) => [desc(fees.createdAt)],
    with: { student: { with: { class: true, section: true } } },
  })

  const students = await db.query.students.findMany({
    orderBy: (students: any, { asc }: any) => [asc(students.firstName)],
    with: { class: true, section: true },
  })

  const totalCollected = feesData
    .filter((f: any) => f.status === 'paid')
    .reduce((sum: number, f: any) => sum + Number(f.paidAmount), 0)

  const totalPending = feesData
    .filter((f: any) => f.status !== 'paid')
    .reduce((sum: number, f: any) => sum + (Number(f.amount) - Number(f.paidAmount)), 0)

  const paidCount = feesData.filter((f: any) => f.status === 'paid').length
  const pendingCount = feesData.filter((f: any) => f.status !== 'paid').length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 p-8 text-white shadow-xl shadow-teal-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Fee Management</h1>
            <p className='text-teal-200 mt-2'>Track student fees, payments, and pending dues</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>💰</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>${totalCollected.toLocaleString()}</p>
                  <p className='text-xs text-teal-200'>Collected</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>⏳</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>${totalPending.toLocaleString()}</p>
                  <p className='text-xs text-teal-200'>Pending</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>✅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{paidCount}</p>
                  <p className='text-xs text-teal-200'>Paid</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📋</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{feesData.length}</p>
                  <p className='text-xs text-teal-200'>Total Records</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>💰</div>
          </div>
        </div>
      </div>

      <FeesClient data={feesData} students={students} />
    </div>
  )
}