import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { fees } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}
    if (status) whereClause.status = status
    if (studentId) whereClause.studentId = studentId

    const allFees = await db.query.fees.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      with: { student: { with: { class: true, section: true } } },
      orderBy: (fees: any, { desc }: any) => [desc(fees.createdAt)],
    })

    return NextResponse.json(allFees)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const fee = await db.insert(fees).values({
      ...body,
      dueDate: new Date(body.dueDate),
      paidDate: body.paidDate ? new Date(body.paidDate) : null,
    }).returning()

    return NextResponse.json(fee[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}