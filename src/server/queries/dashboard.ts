import { db } from '@/lib/db'
import { students, teachers, classes, attendance, fees } from '@/lib/db/schema'
import { eq, sql, gte, lte, and } from 'drizzle-orm'

export async function getDashboardStats() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
      feeCollection,
      recentAdmissions,
    ] = await Promise.all([
      db.$count(students),
      db.$count(teachers),
      db.$count(classes),
      db.query.attendance.findMany({
        where: eq(attendance.date, today),
      }),
      db.query.fees.findMany({
        where: and(
          gte(fees.paidDate, thirtyDaysAgo),
          eq(fees.status, 'paid')
        ),
      }),
      db.query.students.findMany({
        where: gte(students.createdAt, new Date(thirtyDaysAgo)),
        orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
        limit: 10,
        with: {
          class: true,
        },
      }),
    ])

    const attendanceStats = {
      total: todayAttendance.length,
      present: todayAttendance.filter((a: any) => a.status === 'present').length,
      absent: todayAttendance.filter((a: any) => a.status === 'absent').length,
      late: todayAttendance.filter((a: any) => a.status === 'late').length,
      percentage: todayAttendance.length > 0
        ? ((todayAttendance.filter((a: any) => a.status === 'present' || a.status === 'late').length / todayAttendance.length) * 100).toFixed(1)
        : '0',
    }

    const revenueStats = {
      totalCollected: feeCollection.reduce((sum: number, f: any) => sum + Number(f.paidAmount), 0),
      totalTransactions: feeCollection.length,
    }

    const monthlyEnrollment = await getMonthlyEnrollment()

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceStats,
      revenueStats,
      recentAdmissions,
      monthlyEnrollment,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

async function getMonthlyEnrollment() {
  const months = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

    const count = await db.$count(
      students,
      and(
        gte(students.admissionDate, monthStart),
        lte(students.admissionDate, monthEnd)
      )
    )

    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      count,
    })
  }

  return months
}

export async function getRecentActivities() {
  try {
    const recentStudents = await db.query.students.findMany({
      orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
      limit: 5,
    })

    const recentFees = await db.query.fees.findMany({
      where: eq(fees.status, 'paid'),
      orderBy: (fees: any, { desc }: any) => [desc(fees.paidDate)],
      limit: 5,
      with: {
        student: true,
      },
    })

    return {
      recentStudents,
      recentFees,
    }
  } catch (error) {
    return null
  }
}

export async function getClassWiseStrength() {
  try {
    const classData = await db.query.classes.findMany({
      with: {
        students: true,
        sections: true,
      },
      orderBy: (classes: any, { asc }: any) => [asc(classes.numericName)],
    })

    return classData.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      totalStudents: (cls.students || []).length,
      sections: (cls.sections || []).length,
      capacity: cls.capacity || 0,
      occupancyRate: cls.capacity ? (((cls.students || []).length / cls.capacity) * 100).toFixed(1) : '0',
    }))
  } catch (error) {
    return []
  }
}