import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachers, users } from '@/lib/db/schema'
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
    delete updateData.id; delete updateData.userId; delete updateData.employeeId; delete updateData.createdAt

    const [updated] = await db.update(teachers).set(updateData).where(eq(teachers.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating teacher:', error)
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
    const existing = await db.query.teachers.findFirst({ where: eq(teachers.id, id) })
    if (!existing) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    await db.delete(teachers).where(eq(teachers.id, id))
    if (existing.userId) await db.delete(users).where(eq(users.id, existing.userId))

    return NextResponse.json({ success: true, message: 'Teacher deleted' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
