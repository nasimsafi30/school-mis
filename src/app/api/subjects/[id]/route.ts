import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subjects, exams, timetable, results, teachers, classes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/subjects/:id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.id, (await context.params).id),
      with: {
        class: {
          with: {
            sections: true,
          },
        },
        teacher: {
          with: {
            department: true,
          },
        },
        exams: {
          with: {
            results: {
              with: {
                student: true,
              },
            },
          },
          orderBy: [desc(exams.date)],
          limit: 10,
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalExams = subject.exams?.length || 0
    const completedExams = subject.exams?.filter((e: any) => e.status === 'completed').length || 0
    const upcomingExams = subject.exams?.filter((e: any) => e.status === 'upcoming').length || 0

    let totalMarks = 0
    let totalStudents = 0
    let passCount = 0

    subject.exams?.forEach((exam: any) => {
      if (exam.results && exam.results.length > 0) {
        exam.results.forEach((result: any) => {
          totalMarks += Number(result.marksObtained)
          totalStudents++
          if (Number(result.marksObtained) >= exam.passingMarks) {
            passCount++
          }
        })
      }
    })

    const stats = {
      totalExams,
      completedExams,
      upcomingExams,
      totalStudentsAssessed: totalStudents,
      averageMarks: totalStudents > 0 ? (totalMarks / totalStudents).toFixed(1) : '0',
      passRate: totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : '0',
      teacherName: subject.teacher
        ? `${subject.teacher.firstName} ${subject.teacher.lastName}`
        : 'Not Assigned',
      teacherDepartment: subject.teacher?.department?.name || 'N/A',
      className: subject.class?.name || 'N/A',
    }

    return NextResponse.json({
      ...subject,
      stats,
    })
  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/subjects/:id
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await db.query.subjects.findFirst({
      where: eq(subjects.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const body = await req.json()

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    }

    delete updateData.id
    delete updateData.code
    delete updateData.createdAt
    delete updateData.exams

    // Validate teacher if changing
    if (body.teacherId && body.teacherId !== existing.teacherId) {
      const teacher = await db.query.teachers.findFirst({
        where: eq(teachers.id, body.teacherId),
      })
      if (!teacher) {
        return NextResponse.json({ error: 'Assigned teacher not found' }, { status: 400 })
      }
    }

    // Validate class if changing
    if (body.classId && body.classId !== existing.classId) {
      const classExists = await db.query.classes.findFirst({
        where: eq(classes.id, body.classId),
      })
      if (!classExists) {
        return NextResponse.json({ error: 'Assigned class not found' }, { status: 400 })
      }
    }

    const [updated] = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, (await context.params).id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/subjects/:id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await db.query.subjects.findFirst({
      where: eq(subjects.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Check for active exams
    const activeExams = await db.query.exams.findMany({
      where: eq(exams.subjectId, (await context.params).id),
    })

    const ongoingExams = activeExams.filter(
      (exam: any) => exam.status === 'upcoming' || exam.status === 'ongoing'
    )

    if (ongoingExams.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete subject with ${ongoingExams.length} active exams`,
          activeExams: ongoingExams.map((e: any) => ({ id: e.id, name: e.name, status: e.status })),
        },
        { status: 400 }
      )
    }

    // Clean up timetable
    await db.delete(timetable).where(eq(timetable.subjectId, (await context.params).id))

    // Delete exam results
    for (const exam of activeExams) {
      await db.delete(results).where(eq(results.examId, exam.id))
    }

    // Update exams - set subjectId to null instead of deleting
    if (activeExams.length > 0) {
      await db
        .update(exams)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(exams.subjectId, (await context.params).id))
    }

    // Delete subject
    const [deleted] = await db
      .delete(subjects)
      .where(eq(subjects.id, (await context.params).id))
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully',
      data: { deletedSubject: deleted },
    })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/subjects/:id
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

    const allowedFields = ['name', 'description', 'teacherId', 'isOptional', 'credits']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'teacherId' && body.teacherId) {
          const teacher = await db.query.teachers.findFirst({
            where: eq(teachers.id, body.teacherId),
          })
          if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 400 })
          }
        }
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updateData.updatedAt = new Date()

    const [updated] = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, (await context.params).id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error patching subject:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}