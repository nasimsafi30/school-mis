'use server'

import { db } from '@/lib/db'
import { attendance, students } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export async function getAttendance(params: {
  classId?: string
  sectionId?: string
  date?: string
  startDate?: string
  endDate?: string
  studentId?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const whereConditions: any[] = []

    if (params.classId) {
      whereConditions.push(eq(attendance.classId, params.classId))
    }
    if (params.date) {
      whereConditions.push(eq(attendance.date, params.date))
    }
    if (params.studentId) {
      whereConditions.push(eq(attendance.studentId, params.studentId))
    }
    if (params.startDate) {
      whereConditions.push(gte(attendance.date, params.startDate))
    }
    if (params.endDate) {
      whereConditions.push(lte(attendance.date, params.endDate))
    }

    const records = await db.query.attendance.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        student: {
          with: {
            class: true,
            section: true,
          },
        },
        class: true,
      },
      orderBy: [desc(attendance.date)],
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function markAttendance(data: {
  classId: string
  date: string
  records: Array<{
    studentId: string
    status: 'present' | 'absent' | 'late' | 'half_day'
    reason?: string
  }>
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    // Delete existing attendance for this date and class
    await db
      .delete(attendance)
      .where(
        and(
          eq(attendance.classId, data.classId),
          eq(attendance.date, data.date)
        )
      )

    // Insert new attendance records
    const attendanceData = data.records.map((record: any) => ({
      studentId: record.studentId,
      classId: data.classId,
      date: data.date,
      status: record.status,
      reason: record.reason,
      markedBy: session.user?.id,
    }))

    const inserted = await db
      .insert(attendance)
      .values(attendanceData)
      .returning()

    revalidatePath('/attendance')
    return {
      success: true,
      data: inserted,
      message: `Attendance marked for ${inserted.length} students`,
    }
  } catch (error) {
    console.error('Error marking attendance:', error)
    return { success: false, error: 'Failed to mark attendance' }
  }
}

export async function getStudentAttendance(studentId: string, days: number = 30) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const records = await db.query.attendance.findMany({
      where: eq(attendance.studentId, studentId),
      orderBy: [desc(attendance.date)],
      limit: days,
    })

    const stats = {
      present: records.filter((r: any) => r.status === 'present').length,
      absent: records.filter((r: any) => r.status === 'absent').length,
      late: records.filter((r: any) => r.status === 'late').length,
      halfDay: records.filter((r: any) => r.status === 'half_day').length,
      total: records.length,
      percentage: records.length > 0
        ? ((records.filter((r: any) => r.status === 'present' || r.status === 'late').length / records.length) * 100).toFixed(1)
        : '0',
    }

    return { success: true, data: records, stats }
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function getClassAttendanceStats(classId: string, date: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const classStudents = await db.query.students.findMany({
      where: eq(students.classId, classId),
    })

    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        eq(attendance.classId, classId),
        eq(attendance.date, date)
      ),
    })

    const present = attendanceRecords.filter((r: any) => r.status === 'present').length
    const absent = attendanceRecords.filter((r: any) => r.status === 'absent').length
    const late = attendanceRecords.filter((r: any) => r.status === 'late').length
    const halfDay = attendanceRecords.filter((r: any) => r.status === 'half_day').length
    const unmarked = classStudents.length - attendanceRecords.length

    return {
      success: true,
      data: {
        totalStudents: classStudents.length,
        present,
        absent,
        late,
        halfDay,
        unmarked,
        percentage: classStudents.length > 0
          ? ((present + late + halfDay) / classStudents.length * 100).toFixed(1)
          : '0',
      },
    }
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance stats' }
  }
}