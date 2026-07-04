import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { PayrollClient } from './components/client'

export default async function PayrollPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const payroll: any[] = await db.query.payroll.findMany({
    with: { employee: true },
    orderBy: (payroll: any, { desc }: any) => [desc(payroll.year), desc(payroll.month)],
  })

  const teachers: any[] = await db.query.teachers.findMany()

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const totalPayroll = payroll
    .filter((p: any) => p.month === currentMonth)
    .reduce((sum: number, p: any) => sum + Number(p.netSalary), 0)
  
  const paidCount = payroll.filter((p: any) => p.status === 'paid').length
  const pendingCount = payroll.filter((p: any) => p.status !== 'paid').length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 p-8 text-white shadow-xl shadow-lime-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Payroll Management</h1>
            <p className='text-lime-200 mt-2'>Process employee salaries and manage payments</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>💵</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>${totalPayroll.toLocaleString()}</p>
                  <p className='text-xs text-lime-200'>{currentMonth} Payroll</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📋</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{payroll.length}</p>
                  <p className='text-xs text-lime-200'>Total Records</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>✅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{paidCount}</p>
                  <p className='text-xs text-lime-200'>Paid</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>⏳</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{pendingCount}</p>
                  <p className='text-xs text-lime-200'>Pending</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>💵</div>
          </div>
        </div>
      </div>

      <PayrollClient data={payroll} teachers={teachers} />
    </div>
  )
}