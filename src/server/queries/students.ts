import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq, sql, like, or } from 'drizzle-orm'

export async function getStudentStats() {
  try {
    const totalStudents = await db.$count(students)

    const enrolledStudents = await db.$count(
      students,
      eq(students.admissionStatus, 'enrolled')
    )

    const pendingStudents = await db.$count(
      students,
      eq(students.admissionStatus, 'pending')
    )

    const recentAdmissions = await db.query.students.findMany({
      orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
      limit: 5,
      with: {
        class: true,
        section: true,
      },
    })

    const classWiseCount = await db
      .select({
        classId: students.classId,
        count: sql<number>`count(*)`,
      })
      .from(students)
      .groupBy(students.classId)

    return {
      totalStudents,
      enrolledStudents,
      pendingStudents,
      recentAdmissions,
      classWiseCount,
    }
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return null
  }
}

export async function getStudentByAdmissionNo(admissionNo: string) {
  try {
    return await db.query.students.findFirst({
      where: eq(students.admissionNo, admissionNo),
      with: {
        class: true,
        section: true,
        parent: true,
      },
    })
  } catch (error) {
    return null
  }
}

export async function searchStudents(query: string) {
  try {
    return await db.query.students.findMany({
      where: (students: any, { or, ilike }: any) =>
        or(
          ilike(students.firstName, `%${query}%`),
          ilike(students.lastName, `%${query}%`),
          ilike(students.admissionNo, `%${query}%`),
          ilike(students.rollNo, `%${query}%`)
        ),
      with: {
        class: true,
        section: true,
      },
      limit: 10,
    })
  } catch (error) {
    return []
  }
}