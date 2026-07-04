'use server'

import { db } from '@/lib/db'
import { exams, results } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export async function getExams(params?: {
  classId?: string
  type?: string
  status?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const whereConditions: any[] = []

    if (params?.classId) {
      whereConditions.push(eq(exams.classId, params.classId))
    }
    if (params?.type) {
      whereConditions.push(eq(exams.type, params.type as any))
    }
    if (params?.status) {
      whereConditions.push(eq(exams.status, params.status as any))
    }

    const examData = await db.query.exams.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        class: true,
        subject: true,
        results: {
          with: { student: true },
        },
      },
      orderBy: [desc(exams.date)],
    })

    return { success: true, data: examData }
  } catch (error) {
    console.error('Error fetching exams:', error)
    return { success: false, error: 'Failed to fetch exams' }
  }
}

export async function getExamById(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, id),
      with: {
        class: true,
        subject: true,
        results: {
          with: { student: true },
          orderBy: [desc(results.marksObtained)],
        },
      },
    })

    if (!exam) return { success: false, error: 'Exam not found' }

    const marks = exam.results.map((r: any) => Number(r.marksObtained))
    const stats = {
      totalStudents: exam.results.length,
      highestMarks: marks.length > 0 ? Math.max(...marks) : 0,
      lowestMarks: marks.length > 0 ? Math.min(...marks) : 0,
      averageMarks: marks.length > 0 ? (marks.reduce((a: number, b: number) => a + b, 0) / marks.length).toFixed(1) : '0',
      passCount: exam.results.filter((r: any) => Number(r.marksObtained) >= exam.passingMarks).length,
      failCount: exam.results.filter((r: any) => Number(r.marksObtained) < exam.passingMarks).length,
      passPercentage: exam.results.length > 0 ? ((exam.results.filter((r: any) => Number(r.marksObtained) >= exam.passingMarks).length / exam.results.length) * 100).toFixed(1) : '0',
    }

    return { success: true, data: { ...exam, stats } }
  } catch (error) {
    return { success: false, error: 'Failed to fetch exam' }
  }
}

export async function createExam(data: {
  name: string
  type: string
  classId: string
  subjectId: string
  date: string
  startTime: string
  endTime: string
  totalMarks: number
  passingMarks: number
  academicYear: string
  description?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const [exam] = await db
      .insert(exams)
      .values({
        name: data.name,
        type: data.type as any,
        classId: data.classId,
        subjectId: data.subjectId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        academicYear: data.academicYear,
        description: data.description || null,
      })
      .returning()

    revalidatePath('/exams')
    return { success: true, data: exam }
  } catch (error) {
    return { success: false, error: 'Failed to create exam' }
  }
}

export async function publishResults(examId: string, resultsData: Array<{
  studentId: string
  subjectId: string
  marksObtained: number
  remarks?: string
}>) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) })
    if (!exam) return { success: false, error: 'Exam not found' }

    await db.delete(results).where(eq(results.examId, examId))

    const resultRecords = resultsData.map(result => {
      const percentage = (result.marksObtained / exam.totalMarks) * 100
      let grade = 'F'
      if (percentage >= 90) grade = 'A+'
      else if (percentage >= 80) grade = 'A'
      else if (percentage >= 70) grade = 'B+'
      else if (percentage >= 60) grade = 'B'
      else if (percentage >= 50) grade = 'C'
      else if (percentage >= 40) grade = 'D'

      return {
        examId,
        studentId: result.studentId,
        subjectId: result.subjectId || exam.subjectId,
        marksObtained: result.marksObtained.toString(),
        grade,
        remarks: result.remarks || null,
      }
    })

    const inserted = await db.insert(results).values(resultRecords).returning()

    await db.update(exams).set({ status: 'completed' as any, updatedAt: new Date() }).where(eq(exams.id, examId))

    revalidatePath('/exams')
    revalidatePath('/results')
    return { success: true, data: inserted, message: `Results published for ${inserted.length} students` }
  } catch (error) {
    return { success: false, error: 'Failed to publish results' }
  }
}

export async function deleteExam(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await db.delete(results).where(eq(results.examId, id))
    await db.delete(exams).where(eq(exams.id, id))

    revalidatePath('/exams')
    return { success: true, message: 'Exam deleted' }
  } catch (error) {
    return { success: false, error: 'Failed to delete exam' }
  }
}
