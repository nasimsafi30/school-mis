import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { classes, sections, students } from '@/lib/db/schema'
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
    console.log('Updating class:', id, body)

    const updateData: any = { ...body, updatedAt: new Date() }
    delete updateData.id
    delete updateData.createdAt
    delete updateData.sections

    const [updated] = await db
      .update(classes)
      .set(updateData)
      .where(eq(classes.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating class:', error)
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
    console.log('Deleting class:', id)

    // Check for students
    const studentCount = await db.$count(students, eq(students.classId, id))
    if (studentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete class with ${studentCount} students. Reassign students first.` },
        { status: 400 }
      )
    }

    // Delete sections first
    await db.delete(sections).where(eq(sections.classId, id))

    // Delete class
    const [deleted] = await db.delete(classes).where(eq(classes.id, id)).returning()

    return NextResponse.json({ success: true, message: 'Class deleted', data: deleted })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
