'use server'

import { db } from '@/lib/db'
import { students, users, attendance, fees, results } from '@/lib/db/schema'
import { eq, and, like, or, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { studentSchema } from '@/lib/validations/student'
import { auth } from '@/lib/auth'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

export async function getStudents(params?: {
  page?: number
  limit?: number
  search?: string
  classId?: string
  status?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const page = params?.page || 1
    const limit = params?.limit || 10
    const offset = (page - 1) * limit

    const whereConditions: any[] = []

    if (params?.search) {
      whereConditions.push(
        or(
          like(students.firstName, `%${params.search}%`),
          like(students.lastName, `%${params.search}%`),
          like(students.email, `%${params.search}%`),
          like(students.admissionNo, `%${params.search}%`)
        )
      )
    }

    if (params?.classId) {
      whereConditions.push(eq(students.classId, params.classId))
    }

    if (params?.status) {
      whereConditions.push(eq(students.admissionStatus, params.status as any))
    }

    const [studentData, totalCount] = await Promise.all([
      db.query.students.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          class: true,
          section: true,
          parent: true,
        },
        limit,
        offset,
        orderBy: [desc(students.createdAt)],
      }),
      db.$count(students),
    ])

    return {
      success: true,
      data: studentData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    return { success: false, error: 'Failed to fetch students' }
  }
}

export async function getStudentById(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const student = await db.query.students.findFirst({
      where: eq(students.id, id),
      with: {
        class: true,
        section: true,
        parent: true,
        attendance: {
          orderBy: [desc(attendance.date)],
          limit: 30,
        },
        results: {
          with: {
            exam: true,
            subject: true,
          },
          orderBy: [desc(results.createdAt)],
        },
        fees: {
          orderBy: [desc(fees.createdAt)],
        },
      },
    })

    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    return { success: true, data: student }
  } catch (error) {
    console.error('Error fetching student:', error)
    return { success: false, error: 'Failed to fetch student' }
  }
}

export async function createStudent(data: {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  admissionDate: string
  email?: string
  phone?: string
  address?: string
  classId?: string
  sectionId?: string
  bloodGroup?: string
  medicalInfo?: string
  previousSchool?: string
  parentId?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    // Generate admission number
    const admissionNo = `ADM${new Date().getFullYear()}${nanoid(6).toUpperCase()}`
    const rollNo = data.classId ? `ROLL${nanoid(4).toUpperCase()}` : null

    // Create user account if email is provided
    let userId: string | null = null
    if (data.email) {
      const hashedPassword = await bcrypt.hash('student123', 10)
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          password: hashedPassword,
          role: 'student',
        })
        .returning()
      userId = user.id
    }

    const [student] = await db
      .insert(students)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as any,
        admissionNo,
        rollNo,
        admissionDate: data.admissionDate,
        admissionStatus: 'enrolled',
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        classId: data.classId || null,
        sectionId: data.sectionId || null,
        bloodGroup: data.bloodGroup as any || null,
        medicalInfo: data.medicalInfo || null,
        previousSchool: data.previousSchool || null,
        parentId: data.parentId || null,
        userId,
      })
      .returning()

    revalidatePath('/students')
    return { success: true, data: student }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create student' }
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove protected fields
    delete updateData.id
    delete updateData.userId
    delete updateData.admissionNo
    delete updateData.createdAt

    const [student] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning()

    // Update user email if changed
    if (data.email) {
      const existing = await db.query.students.findFirst({
        where: eq(students.id, id),
      })
      if (existing?.userId) {
        await db
          .update(users)
          .set({ email: data.email, updatedAt: new Date() })
          .where(eq(users.id, existing.userId))
      }
    }

    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    return { success: true, data: student }
  } catch (error) {
    return { success: false, error: 'Failed to update student' }
  }
}

export async function deleteStudent(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const existing = await db.query.students.findFirst({
      where: eq(students.id, id),
    })

    if (!existing) {
      return { success: false, error: 'Student not found' }
    }

    // Delete related records
    await db.delete(attendance).where(eq(attendance.studentId, id))
    await db.delete(results).where(eq(results.studentId, id))
    await db.delete(fees).where(eq(fees.studentId, id))

    // Delete student
    await db.delete(students).where(eq(students.id, id))

    // Delete associated user if exists
    if (existing.userId) {
      await db.delete(users).where(eq(users.id, existing.userId))
    }

    revalidatePath('/students')
    return { success: true, message: 'Student deleted successfully' }
  } catch (error) {
    return { success: false, error: 'Failed to delete student' }
  }
}

export async function updateStudentStatus(id: string, status: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const [student] = await db
      .update(students)
      .set({
        admissionStatus: status as any,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning()

    revalidatePath('/students')
    return { success: true, data: student }
  } catch (error) {
    return { success: false, error: 'Failed to update student status' }
  }
}