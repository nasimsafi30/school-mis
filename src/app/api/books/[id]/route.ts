import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { books, issuedBooks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/books/:id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const book = await db.query.books.findFirst({
      where: eq(books.id, id),
      with: {
        issuedBooks: {
          with: { student: true, teacher: true },
          orderBy: (issuedBooks: any, { desc }: any) => [desc(issuedBooks.issueDate)],
          limit: 20,
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const stats = {
      totalIssued: book.issuedBooks.length,
      currentlyIssued: book.issuedBooks.filter((ib: any) => ib.status === 'issued').length,
      returned: book.issuedBooks.filter((ib: any) => ib.status === 'returned').length,
      overdue: book.issuedBooks.filter((ib: any) => ib.status === 'overdue').length,
      totalFines: book.issuedBooks.reduce((sum: number, ib: any) => sum + Number(ib.fine), 0),
    }

    return NextResponse.json({ ...book, stats })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/books/:id
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const body = await req.json()
    const updateData: any = { ...body, updatedAt: new Date() }
    delete updateData.id; delete updateData.isbn; delete updateData.createdAt

    const [updated] = await db.update(books).set(updateData).where(eq(books.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/books/:id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const activeIssues = await db.$count(issuedBooks, eq(issuedBooks.bookId, id))
    if (activeIssues > 0) {
      return NextResponse.json({ error: `Cannot delete book with ${activeIssues} active issues` }, { status: 400 })
    }

    await db.delete(books).where(eq(books.id, id))
    return NextResponse.json({ success: true, message: 'Book deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}