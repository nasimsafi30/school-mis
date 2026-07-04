import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { issuedBooks, books } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const issued = await db.query.issuedBooks.findFirst({
      where: eq(issuedBooks.id, (await context.params).id),
      with: {
        book: true,
        student: {
          with: {
            class: true,
            section: true,
          },
        },
        teacher: {
          with: {
            department: true,
          },
        },
      },
    })

    if (!issued) {
      return NextResponse.json({ error: 'Issued book record not found' }, { status: 404 })
    }

    let fine = Number(issued.fine)
    if (issued.status === 'issued' && new Date(issued.dueDate) < new Date()) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(issued.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      fine = daysOverdue * 1
    }

    return NextResponse.json({ ...issued, calculatedFine: fine })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const issued = await db.query.issuedBooks.findFirst({
      where: eq(issuedBooks.id, (await context.params).id),
    })

    if (!issued) {
      return NextResponse.json({ error: 'Issued book record not found' }, { status: 404 })
    }

    let fine = 0
    if (new Date(issued.dueDate) < new Date()) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(issued.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      fine = daysOverdue * 1
    }

    const updateData: any = {
      returnDate: new Date(),
      status: 'returned',
      fine: fine.toString(),
      updatedAt: new Date(),
    }

    const [updated] = await db
      .update(issuedBooks)
      .set(updateData)
      .where(eq(issuedBooks.id, (await context.params).id))
      .returning()

    const book = await db.query.books.findFirst({
      where: eq(books.id, issued.bookId),
    })

    if (book) {
      await db
        .update(books)
        .set({
          availableCopies: book.availableCopies + 1,
          updatedAt: new Date(),
        })
        .where(eq(books.id, book.id))
    }

    return NextResponse.json({
      ...updated,
      message: fine > 0 ? `Book returned. Fine: $${fine}` : 'Book returned successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const issued = await db.query.issuedBooks.findFirst({
      where: eq(issuedBooks.id, (await context.params).id),
    })

    if (!issued) {
      return NextResponse.json({ error: 'Issued book record not found' }, { status: 404 })
    }

    if (issued.status === 'issued') {
      const book = await db.query.books.findFirst({
        where: eq(books.id, issued.bookId),
      })
      if (book) {
        await db
          .update(books)
          .set({
            availableCopies: book.availableCopies + 1,
            updatedAt: new Date(),
          })
          .where(eq(books.id, book.id))
      }
    }

    await db.delete(issuedBooks).where(eq(issuedBooks.id, (await context.params).id))

    return NextResponse.json({
      success: true,
      message: 'Issued book record deleted successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}