import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { results, exams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allResults = await db.query.results.findMany({
      with: {
        student: { with: { class: true, section: true } },
        exam: { with: { subject: true } },
        subject: true,
      },
      orderBy: (results: any, { desc }: any) => [desc(results.createdAt)],
    })

    return NextResponse.json(allResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('Creating result:', body)

    if (!body.examId || !body.studentId || body.marksObtained === undefined) {
      return NextResponse.json({ error: 'Missing required fields: examId, studentId, marksObtained' }, { status: 400 })
    }

    // Get exam to calculate grade
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, body.examId),
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Calculate grade
    const percentage = (Number(body.marksObtained) / exam.totalMarks) * 100
    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B+'
    else if (percentage >= 60) grade = 'B'
    else if (percentage >= 50) grade = 'C'
    else if (percentage >= 40) grade = 'D'

    // Check if result already exists for this student and exam
    const existingResult = await db.query.results.findFirst({
      where: (results: any, { and }: any) => and(
        eq(results.studentId, body.studentId),
        eq(results.examId, body.examId)
      ),
    })

    if (existingResult) {
      // Update existing result
      const [updated] = await db
        .update(results)
        .set({
          marksObtained: body.marksObtained.toString(),
          grade,
          remarks: body.remarks || null,
          updatedAt: new Date(),
        })
        .where(eq(results.id, existingResult.id))
        .returning()

      return NextResponse.json({ success: true, data: updated, message: 'Result updated' })
    }

    // Create new result
    const [result] = await db
      .insert(results)
      .values({
        studentId: body.studentId,
        examId: body.examId,
        subjectId: exam.subjectId,
        marksObtained: body.marksObtained.toString(),
        grade,
        remarks: body.remarks || null,
      })
      .returning()

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}