import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { exams } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const type = searchParams.get('type')

    let whereClause: any = {}
    if (classId) whereClause.classId = classId
    if (type) whereClause.type = type

    const allExams = await db.query.exams.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      with: { class: true, subject: true },
      orderBy: (exams: any, { desc }: any) => [desc(exams.date)],
    })

    return NextResponse.json(allExams)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const exam = await db.insert(exams).values({
      ...body,
      date: new Date(body.date),
    }).returning()

    return NextResponse.json(exam[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}