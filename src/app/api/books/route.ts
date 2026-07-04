import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { books } from '@/lib/db/schema'
import { like, or } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const allBooks = await db.query.books.findMany({
      where: search ? or(
        like(books.title, '%' + search + '%'),
        like(books.author, '%' + search + '%'),
        like(books.isbn, '%' + search + '%')
      ) : undefined,
      orderBy: (books: any, { asc }: any) => [asc(books.title)],
    })

    return NextResponse.json(allBooks)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const book = await db.insert(books).values({
      ...body,
      availableCopies: body.availableCopies ?? body.totalCopies,
    }).returning()

    return NextResponse.json(book[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}