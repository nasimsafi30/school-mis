import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const [updated] = await db
      .update(notifications)
      .set({
        isRead: body.isRead !== undefined ? body.isRead : true,
      })
      .where(eq(notifications.id, (await context.params).id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    return NextResponse.json(updated)
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.delete(notifications).where(eq(notifications.id, (await context.params).id))
    return NextResponse.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}