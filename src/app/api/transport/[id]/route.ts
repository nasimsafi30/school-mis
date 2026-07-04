import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transport } from '@/lib/db/schema'
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
    delete updateData.id; delete updateData.createdAt

    const [updated] = await db.update(transport).set(updateData).where(eq(transport.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT transport error:', error)
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
    await db.delete(transport).where(eq(transport.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE transport error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
