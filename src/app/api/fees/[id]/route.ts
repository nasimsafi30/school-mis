import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { fees, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fee = await db.query.fees.findFirst({
      where: eq(fees.id, (await context.params).id),
      with: {
        student: {
          with: {
            class: true,
            section: true,
            parent: true,
          },
        },
      },
    })

    if (!fee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    const paymentDetails = {
      amount: Number(fee.amount),
      paidAmount: Number(fee.paidAmount),
      balance: Number(fee.amount) - Number(fee.paidAmount),
      status: fee.status,
      isOverdue: fee.status !== 'paid' && new Date(fee.dueDate) < new Date(),
      daysOverdue: fee.status !== 'paid'
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    }

    return NextResponse.json({ ...fee, paymentDetails })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const updateData: any = { ...body, updatedAt: new Date() }
    
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate)
    if (body.paidDate) updateData.paidDate = new Date(body.paidDate)
    
    delete updateData.id
    delete updateData.createdAt

    if (body.paidAmount && Number(body.paidAmount) > 0) {
      const existing = await db.query.fees.findFirst({
        where: eq(fees.id, (await context.params).id),
      })
      
      if (existing) {
        const newPaidAmount = Number(existing.paidAmount) + Number(body.paidAmount)
        updateData.paidAmount = newPaidAmount
        updateData.paidDate = new Date()
        
        if (newPaidAmount >= Number(existing.amount)) {
          updateData.status = 'paid'
        } else if (newPaidAmount > 0) {
          updateData.status = 'partial'
        }

        if (existing.studentId) {
          await db.insert(notifications).values({
            userId: session.user?.id || '',
            title: 'Fee Payment Received',
            message: `Payment of $${Number(body.paidAmount).toLocaleString()} received`,
            type: 'fee',
            link: `/fees/${(await context.params).id}`,
          })
        }
      }
    }

    const [updated] = await db
      .update(fees)
      .set(updateData)
      .where(eq(fees.id, (await context.params).id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await db.query.fees.findFirst({
      where: eq(fees.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    if (existing.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete a paid fee record' },
        { status: 400 }
      )
    }

    await db.delete(fees).where(eq(fees.id, (await context.params).id))

    return NextResponse.json({
      success: true,
      message: 'Fee record deleted successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

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
    const amount = Number(body.amount)
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    const existing = await db.query.fees.findFirst({
      where: eq(fees.id, (await context.params).id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    const newPaidAmount = Number(existing.paidAmount) + amount
    const newStatus = newPaidAmount >= Number(existing.amount) ? 'paid' : 'partial'

    const [updated] = await db
      .update(fees)
      .set({
        paidAmount: newPaidAmount.toString(),
        status: newStatus as any,
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: body.paymentMethod || 'cash',
        transactionId: body.transactionId,
        updatedAt: new Date(),
      })
      .where(eq(fees.id, (await context.params).id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}