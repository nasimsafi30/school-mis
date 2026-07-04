import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { results, exams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.query.results.findFirst({
      where: eq(results.id, (await context.params).id),
      with: {
        student: {
          with: {
            class: true,
            section: true,
          },
        },
        exam: {
          with: {
            subject: true,
          },
        },
        subject: true,
      },
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    return NextResponse.json(result)
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const updateData: any = { ...body, updatedAt: new Date() }
    delete updateData.id
    delete updateData.createdAt

    if (body.marksObtained !== undefined) {
      const resultExam = await db.query.exams.findFirst({
        where: eq(exams.id, body.examId || ''),
      })
      if (resultExam) {
        const percentage = (Number(body.marksObtained) / resultExam.totalMarks) * 100
        if (percentage >= 90) updateData.grade = 'A+'
        else if (percentage >= 80) updateData.grade = 'A'
        else if (percentage >= 70) updateData.grade = 'B+'
        else if (percentage >= 60) updateData.grade = 'B'
        else if (percentage >= 50) updateData.grade = 'C'
        else if (percentage >= 40) updateData.grade = 'D'
        else updateData.grade = 'F'
      }
    }

    const [updated] = await db
      .update(results)
      .set(updateData)
      .where(eq(results.id, (await context.params).id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.delete(results).where(eq(results.id, (await context.params).id))

    return NextResponse.json({
      success: true,
      message: 'Result deleted successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}