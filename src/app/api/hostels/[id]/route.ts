import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { hostels, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const hostel = await db.query.hostels.findFirst({
      where: eq(hostels.id, (await context.params).id),
      with: {
        students: {
          with: { class: true, section: true },
        },
      },
    })

    if (!hostel) return NextResponse.json({ error: 'Hostel not found' }, { status: 404 })
    return NextResponse.json(hostel)
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
    delete updateData.id
    delete updateData.createdAt

    const [updated] = await db
      .update(hostels)
      .set(updateData)
      .where(eq(hostels.id, (await context.params).id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Hostel not found' }, { status: 404 })
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

    await db
      .update(students)
      .set({ hostelId: null, updatedAt: new Date() })
      .where(eq(students.hostelId, (await context.params).id))

    await db.delete(hostels).where(eq(hostels.id, (await context.params).id))
    return NextResponse.json({ success: true, message: 'Hostel deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}