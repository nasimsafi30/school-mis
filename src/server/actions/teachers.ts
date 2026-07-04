'use server'

import { db } from '@/lib/db'
import { teachers, users, payroll } from '@/lib/db/schema'
import { eq, like, or, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export async function getTeachers(params?: {
  page?: number
  limit?: number
  search?: string
  departmentId?: string
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
          like(teachers.firstName, '%' + params.search + '%'),
          like(teachers.lastName, '%' + params.search + '%'),
          like(teachers.email, '%' + params.search + '%'),
          like(teachers.employeeId, '%' + params.search + '%')
        )
      )
    }

    if (params?.departmentId) {
      whereConditions.push(eq(teachers.departmentId, params.departmentId))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    const [teacherData, totalCount] = await Promise.all([
      db.query.teachers.findMany({
        where: whereClause,
        with: { department: true, classTeacherOf: true },
        limit, offset,
        orderBy: [desc(teachers.createdAt)],
      }),
      db.$count(teachers),
    ])

    return {
      success: true,
      data: teacherData,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    }
  } catch (error) {
    return { success: false, error: 'Failed to fetch teachers' }
  }
}

export async function getTeacherById(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const teacher = await db.query.teachers.findFirst({
      where: eq(teachers.id, id),
      with: { department: true, classTeacherOf: true, subjects: true, payroll: { orderBy: [desc(payroll.createdAt)], limit: 12 } },
    })

    if (!teacher) return { success: false, error: 'Teacher not found' }
    return { success: true, data: teacher }
  } catch (error) {
    return { success: false, error: 'Failed to fetch teacher' }
  }
}

export async function createTeacher(data: any) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const hashedPassword = await bcrypt.hash('teacher123', 10)
    const [user] = await db.insert(users).values({ email: data.email, password: hashedPassword, role: 'teacher' }).returning()

    const employeeId = 'EMP' + new Date().getFullYear() + nanoid(4).toUpperCase()

    const [teacher] = await db.insert(teachers).values({
      userId: user.id, employeeId,
      firstName: data.firstName, lastName: data.lastName,
      email: data.email, phone: data.phone,
      dateOfBirth: data.dateOfBirth, gender: data.gender as any,
      joiningDate: data.joiningDate,
      qualification: data.qualification || null,
      designation: data.designation || null,
      departmentId: data.departmentId || null,
      salary: data.salary?.toString() || null,
      address: data.address || null,
      status: 'active',
    }).returning()

    revalidatePath('/teachers')
    return { success: true, data: teacher }
  } catch (error) {
    return { success: false, error: 'Failed to create teacher' }
  }
}

export async function updateTeacher(id: string, data: any) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const updateData: any = { ...data, updatedAt: new Date() }
    delete updateData.id; delete updateData.userId; delete updateData.employeeId; delete updateData.createdAt

    const [teacher] = await db.update(teachers).set(updateData).where(eq(teachers.id, id)).returning()

    revalidatePath('/teachers')
    return { success: true, data: teacher }
  } catch (error) {
    return { success: false, error: 'Failed to update teacher' }
  }
}

export async function deleteTeacher(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const existing = await db.query.teachers.findFirst({ where: eq(teachers.id, id) })
    if (!existing) return { success: false, error: 'Teacher not found' }

    await db.delete(payroll).where(eq(payroll.employeeId, id))
    await db.delete(teachers).where(eq(teachers.id, id))
    if (existing.userId) await db.delete(users).where(eq(users.id, existing.userId))

    revalidatePath('/teachers')
    return { success: true, message: 'Teacher deleted' }
  } catch (error) {
    return { success: false, error: 'Failed to delete teacher' }
  }
}
