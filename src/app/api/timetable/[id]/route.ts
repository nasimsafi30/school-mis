import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { timetable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    delete updateData.id
    delete updateData.createdAt
    delete updateData.classId
    delete updateData.sectionId

    const [updated] = await db
      .update(timetable)
      .set(updateData)
      .where(eq(timetable.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Period not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating period:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    await db.delete(timetable).where(eq(timetable.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting period:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
