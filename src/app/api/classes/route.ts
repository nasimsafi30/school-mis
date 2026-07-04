import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { classes, sections } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allClasses = await db.query.classes.findMany({
      with: { sections: true },
      orderBy: (classes: any, { asc }: any) => [asc(classes.numericName)],
    })

    return NextResponse.json(allClasses)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const [newClass] = await db.insert(classes).values({
      name: body.name,
      numericName: body.numericName,
      description: body.description,
      capacity: body.capacity,
    }).returning()

    if (body.sections && body.sections.length > 0) {
      const sectionData = body.sections.map((s: any) => ({ ...s, classId: newClass.id }))
      await db.insert(sections).values(sectionData)
    }

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}