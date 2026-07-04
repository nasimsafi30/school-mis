import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}
    if (classId) whereClause.classId = classId
    if (date) whereClause.date = date
    if (studentId) whereClause.studentId = studentId

    const records = await db.query.attendance.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      with: {
        student: true,
        class: true,
      },
      orderBy: (attendance: any, { desc }: any) => [desc(attendance.date)],
    })

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { attendanceRecords, classId, date } = body

    // Delete existing records for this date and class
    await db.delete(attendance).where(
      and(eq(attendance.classId, classId), eq(attendance.date, date))
    )

    // Insert new records
    const records = attendanceRecords.map((record: any) => ({
      ...record,
      markedBy: session.user?.id,
    }))

    const inserted = await db.insert(attendance).values(records).returning()

    return NextResponse.json(inserted, { status: 201 })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}