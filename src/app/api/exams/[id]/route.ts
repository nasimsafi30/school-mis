import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { exams, results, students } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/exams/:id - Get single exam with results and statistics
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, (await context.params).id),
      with: {
        class: true,
        subject: true,
        results: {
          with: {
            student: {
              with: {
                class: true,
                section: true,
              },
            },
          },
          orderBy: [desc(results.marksObtained)],
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Calculate exam statistics
    const marks = exam.results.map((r: any) => Number(r.marksObtained))
    const totalStudents = exam.results.length
    const passedStudents = exam.results.filter(
      (r: any) => Number(r.marksObtained) >= exam.passingMarks
    ).length
    const failedStudents = totalStudents - passedStudents

    const stats = {
      totalStudents,
      highestMarks: marks.length > 0 ? Math.max(...marks) : 0,
      lowestMarks: marks.length > 0 ? Math.min(...marks) : 0,
      averageMarks: marks.length > 0
        ? (marks.reduce((a: number, b: number) => a + b, 0) / marks.length).toFixed(1)
        : '0',
      passCount: passedStudents,
      failCount: failedStudents,
      passPercentage: totalStudents > 0
        ? ((passedStudents / totalStudents) * 100).toFixed(1)
        : '0',
      gradeDistribution: {
        'A+': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.9).length,
        'A': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.8 && Number(r.marksObtained) < exam.totalMarks * 0.9).length,
        'B+': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.7 && Number(r.marksObtained) < exam.totalMarks * 0.8).length,
        'B': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.6 && Number(r.marksObtained) < exam.totalMarks * 0.7).length,
        'C': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.5 && Number(r.marksObtained) < exam.totalMarks * 0.6).length,
        'D': exam.results.filter((r: any) => Number(r.marksObtained) >= exam.totalMarks * 0.4 && Number(r.marksObtained) < exam.totalMarks * 0.5).length,
        'F': exam.results.filter((r: any) => Number(r.marksObtained) < exam.totalMarks * 0.4).length,
      },
      topPerformers: exam.results.slice(0, 5).map((r: any) => ({
        studentId: r.student?.id,
        studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Unknown',
        rollNo: r.student?.rollNo || 'N/A',
        className: r.student?.class?.name || 'N/A',
        marksObtained: Number(r.marksObtained),
        percentage: ((Number(r.marksObtained) / exam.totalMarks) * 100).toFixed(1),
        grade: r.grade,
      })),
    }

    return NextResponse.json({
      ...exam,
      stats,
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/exams/:id - Update exam
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if exam exists
    const existing = await db.query.exams.findFirst({
      where: eq(exams.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const body = await req.json()

    // Build update data
    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    }

    // Convert date if provided
    if (body.date) {
      updateData.date = new Date(body.date)
    }

    // Remove protected fields
    delete updateData.id
    delete updateData.createdAt
    delete updateData.results // Don't update results through exam

    const [updated] = await db
      .update(exams)
      .set(updateData)
      .where(eq(exams.id, (await context.params).id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/exams/:id - Delete exam and its results
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if exam exists
    const existing = await db.query.exams.findFirst({
      where: eq(exams.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Check if exam has results and if it's protected
    if (existing.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete a completed exam. Cancel it first.' },
        { status: 400 }
      )
    }

    // Delete results first (cascade)
    const deletedResults = await db
      .delete(results)
      .where(eq(results.examId, (await context.params).id))
      .returning()

    // Delete exam
    const [deleted] = await db
      .delete(exams)
      .where(eq(exams.id, (await context.params).id))
      .returning()

    return NextResponse.json({
      success: true,
      message: `Exam and ${deletedResults.length} results deleted successfully`,
      data: {
        exam: deleted,
        deletedResults: deletedResults.length,
      },
    })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PATCH /api/exams/:id - Partially update exam (e.g., status change)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Allowed partial update fields
    const allowedFields = ['status', 'description', 'date', 'startTime', 'endTime']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'date') {
          updateData[field] = new Date(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updateData.updatedAt = new Date()

    const [updated] = await db
      .update(exams)
      .set(updateData)
      .where(eq(exams.id, (await context.params).id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // If exam is being completed, calculate final statistics
    let stats = null
    if (body.status === 'completed' && updated) {
      const examResults = await db.query.results.findMany({
        where: eq(results.examId, (await context.params).id),
      })

      const marks = examResults.map((r: any) => Number(r.marksObtained))
      stats = {
        totalStudents: examResults.length,
        averageMarks: marks.length > 0
          ? (marks.reduce((a: number, b: number) => a + b, 0) / marks.length).toFixed(1)
          : '0',
      }
    }

    return NextResponse.json({
      ...updated,
      stats,
    })
  } catch (error) {
    console.error('Error patching exam:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}