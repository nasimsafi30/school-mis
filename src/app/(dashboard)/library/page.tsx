import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { LibraryClient } from './components/client'

export default async function LibraryPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const books: any[] = await db.query.books.findMany({ 
    orderBy: (books: any, { asc }: any) => [asc(books.title)] 
  })
  
  const issuedBooks: any[] = await db.query.issuedBooks.findMany({
    with: { book: true, student: true, teacher: true },
    orderBy: (issuedBooks: any, { desc }: any) => [desc(issuedBooks.issueDate)],
  })

  const totalCopies = books.reduce((sum: number, b: any) => sum + (b.totalCopies || 0), 0)
  const availableCopies = books.reduce((sum: number, b: any) => sum + (b.availableCopies || 0), 0)
  const currentlyIssued = issuedBooks.filter((ib: any) => ib.status === 'issued').length
  const overdueBooks = issuedBooks.filter((ib: any) => ib.status === 'overdue').length

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-8 text-white shadow-xl shadow-amber-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Library Management</h1>
            <p className='text-amber-200 mt-2'>Manage books, issues, returns, and inventory</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📚</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{books.length}</p>
                  <p className='text-xs text-amber-200'>Total Books</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📖</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{availableCopies}</p>
                  <p className='text-xs text-amber-200'>Available</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>📤</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{currentlyIssued}</p>
                  <p className='text-xs text-amber-200'>Issued</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>⚠️</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{overdueBooks}</p>
                  <p className='text-xs text-amber-200'>Overdue</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📚</div>
          </div>
        </div>
      </div>

      <LibraryClient books={books} issuedBooks={issuedBooks} />
    </div>
  )
}