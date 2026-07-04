import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachers, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { photo } = body
    if (!photo) return NextResponse.json({ error: 'No photo provided' }, { status: 400 })

    let saved = false

    const teacher = await db.query.teachers.findFirst({ where: eq(teachers.userId, session.user.id) })
    if (teacher) {
      await db.update(teachers).set({ profileImage: photo, updatedAt: new Date() }).where(eq(teachers.id, teacher.id))
      saved = true
    }

    if (!saved) {
      const student = await db.query.students.findFirst({ where: eq(students.userId, session.user.id) })
      if (student) {
        await db.update(students).set({ profileImage: photo, updatedAt: new Date() }).where(eq(students.id, student.id))
        saved = true
      }
    }

    return NextResponse.json({ success: true, url: photo, saved })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ photoUrl: null })

    const teacher = await db.query.teachers.findFirst({ where: eq(teachers.userId, session.user.id) })
    if (teacher?.profileImage) return NextResponse.json({ photoUrl: teacher.profileImage })

    const student = await db.query.students.findFirst({ where: eq(students.userId, session.user.id) })
    if (student?.profileImage) return NextResponse.json({ photoUrl: student.profileImage })

    return NextResponse.json({ photoUrl: null })
  } catch {
    return NextResponse.json({ photoUrl: null })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teacher = await db.query.teachers.findFirst({ where: eq(teachers.userId, session.user.id) })
    if (teacher) await db.update(teachers).set({ profileImage: null, updatedAt: new Date() }).where(eq(teachers.id, teacher.id))

    const student = await db.query.students.findFirst({ where: eq(students.userId, session.user.id) })
    if (student) await db.update(students).set({ profileImage: null, updatedAt: new Date() }).where(eq(students.id, student.id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
