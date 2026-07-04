import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { issuedBooks, books } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allIssued = await db.query.issuedBooks.findMany({
      with: { book: true, student: true, teacher: true },
      orderBy: (issuedBooks: any, { desc }: any) => [desc(issuedBooks.issueDate)],
    })

    return NextResponse.json(allIssued)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    
    // Check if book is available
    const book = await db.query.books.findFirst({ where: eq(books.id, body.bookId) })
    if (!book || book.availableCopies < 1) {
      return NextResponse.json({ error: 'Book not available' }, { status: 400 })
    }

    // Create issue record
    const issued = await db.insert(issuedBooks).values({
      ...body,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
    }).returning()

    // Update available copies
    await db.update(books).set({
      availableCopies: book.availableCopies - 1,
      updatedAt: new Date(),
    }).where(eq(books.id, body.bookId))

    return NextResponse.json(issued[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}