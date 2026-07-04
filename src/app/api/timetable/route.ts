import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { timetable } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const records = await db.query.timetable.findMany({
      with: { class: true, section: true, subject: true, teacher: true },
      orderBy: (timetable: any, { asc }: any) => [asc(timetable.dayOfWeek), asc(timetable.startTime)],
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('GET timetable error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('POST timetable body:', body)

    if (!body.classId || !body.sectionId || !body.subjectId || !body.teacherId || !body.dayOfWeek || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [record] = await db.insert(timetable).values({
      classId: body.classId,
      sectionId: body.sectionId,
      subjectId: body.subjectId,
      teacherId: body.teacherId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      roomNo: body.roomNo || null,
    }).returning()

    console.log('Created:', record)
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('POST timetable error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}