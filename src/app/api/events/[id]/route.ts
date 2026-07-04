import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await db.query.events.findFirst({
      where: eq(events.id, (await context.params).id),
    })

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    return NextResponse.json(event)
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updateData: any = { ...body, updatedAt: new Date() }
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    delete updateData.id
    delete updateData.createdAt

    const [updated] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, (await context.params).id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
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

    await db.delete(events).where(eq(events.id, (await context.params).id))
    return NextResponse.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}