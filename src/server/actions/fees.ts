'use server'

import { db } from '@/lib/db'
import { fees, notifications } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { feeSchema } from '@/lib/validations/fee'

export async function getFees(params?: {
  studentId?: string
  status?: string
  academicYear?: string
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const page = params?.page || 1
    const limit = params?.limit || 10
    const offset = (page - 1) * limit

    const whereConditions: any[] = []

    if (params?.studentId) {
      whereConditions.push(eq(fees.studentId, params.studentId))
    }
    if (params?.status) {
      whereConditions.push(eq(fees.status, params.status as any))
    }
    if (params?.academicYear) {
      whereConditions.push(eq(fees.academicYear, params.academicYear))
    }

    const [feeData, totalCount] = await Promise.all([
      db.query.fees.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          student: {
            with: {
              class: true,
              section: true,
            },
          },
        },
        limit,
        offset,
        orderBy: [desc(fees.createdAt)],
      }),
      db.$count(fees),
    ])

    return {
      success: true,
      data: feeData,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    }
  } catch (error) {
    console.error('Error fetching fees:', error)
    return { success: false, error: 'Failed to fetch fees' }
  }
}

export async function createFee(data: {
  studentId: string
  feeType: string
  amount: number
  dueDate: string
  academicYear: string
  remarks?: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const [fee] = await db
      .insert(fees)
      .values({
        studentId: data.studentId,
        feeType: data.feeType,
        amount: data.amount.toString(),
        dueDate: data.dueDate,
        academicYear: data.academicYear,
        remarks: data.remarks || null,
        status: 'pending',
      })
      .returning()

    revalidatePath('/fees')
    return { success: true, data: fee }
  } catch (error) {
    return { success: false, error: 'Failed to create fee' }
  }
}

export async function recordPayment(
  feeId: string,
  amount: number,
  paymentMethod?: string,
  transactionId?: string
) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const existingFee = await db.query.fees.findFirst({
      where: eq(fees.id, feeId),
      with: { student: true },
    })

    if (!existingFee) {
      return { success: false, error: 'Fee record not found' }
    }

    const newPaidAmount = Number(existingFee.paidAmount) + amount
    const newStatus = newPaidAmount >= Number(existingFee.amount) ? 'paid' : 'partial'

    const [updated] = await db
      .update(fees)
      .set({
        paidAmount: newPaidAmount.toString(),
        status: newStatus as any,
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'cash',
        transactionId: transactionId || null,
        updatedAt: new Date(),
      })
      .where(eq(fees.id, feeId))
      .returning()

    // Create notification for payment
    if (existingFee.student?.userId) {
      await db.insert(notifications).values({
        userId: existingFee.student.userId,
        title: 'Payment Received',
        message: `Payment of $${amount} received for ${existingFee.feeType}`,
        type: 'fee',
        link: '/fees',
      })
    }

    revalidatePath('/fees')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: 'Failed to record payment' }
  }
}

export async function getFeeStats(academicYear?: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const allFees = academicYear
      ? await db.query.fees.findMany({
          where: eq(fees.academicYear, academicYear),
        })
      : await db.query.fees.findMany()

    const totalAmount = allFees.reduce((sum: number, f: any) => sum + Number(f.amount), 0)
    const totalCollected = allFees.reduce((sum: number, f: any) => sum + Number(f.paidAmount), 0)
    const totalPending = allFees
      .filter((f: any) => f.status === 'pending' || f.status === 'partial')
      .reduce((sum: number, f: any) => sum + (Number(f.amount) - Number(f.paidAmount)), 0)
    const totalOverdue = allFees
      .filter((f: any) => f.status === 'overdue')
      .reduce((sum: number, f: any) => sum + Number(f.amount), 0)

    return {
      success: true,
      data: {
        totalAmount,
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate: totalAmount > 0 ? ((totalCollected / totalAmount) * 100).toFixed(1) : '0',
        totalRecords: allFees.length,
        paidCount: allFees.filter((f: any) => f.status === 'paid').length,
        pendingCount: allFees.filter((f: any) => f.status === 'pending' || f.status === 'partial').length,
        overdueCount: allFees.filter((f: any) => f.status === 'overdue').length,
      },
    }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee stats' }
  }
}

export async function deleteFee(id: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await db.delete(fees).where(eq(fees.id, id))

    revalidatePath('/fees')
    return { success: true, message: 'Fee record deleted' }
  } catch (error) {
    return { success: false, error: 'Failed to delete fee' }
  }
}