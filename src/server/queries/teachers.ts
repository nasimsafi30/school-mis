import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { eq, sql, like, or } from 'drizzle-orm'

export async function getTeacherStats() {
  try {
    const totalTeachers = await db.$count(teachers)

    const activeTeachers = await db.$count(
      teachers,
      eq(teachers.status, 'active')
    )

    const departmentWiseCount = await db
      .select({
        departmentId: teachers.departmentId,
        count: sql<number>`count(*)`,
      })
      .from(teachers)
      .groupBy(teachers.departmentId)

    const recentJoinees = await db.query.teachers.findMany({
      orderBy: (teachers: any, { desc }: any) => [desc(teachers.createdAt)],
      limit: 5,
      with: {
        department: true,
      },
    })

    return {
      totalTeachers,
      activeTeachers,
      departmentWiseCount,
      recentJoinees,
    }
  } catch (error) {
    console.error('Error fetching teacher stats:', error)
    return null
  }
}

export async function searchTeachers(query: string) {
  try {
    return await db.query.teachers.findMany({
      where: (teachers: any, { or, ilike }: any) =>
        or(
          ilike(teachers.firstName, `%${query}%`),
          ilike(teachers.lastName, `%${query}%`),
          ilike(teachers.email, `%${query}%`),
          ilike(teachers.employeeId, `%${query}%`)
        ),
      with: {
        department: true,
      },
      limit: 10,
    })
  } catch (error) {
    return []
  }
}