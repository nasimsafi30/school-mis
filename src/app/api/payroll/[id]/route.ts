import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payroll } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const body = await req.json()

    const basicSalary = Number(body.basicSalary) || 0
    const allowances = Number(body.allowances) || 0
    const deductions = Number(body.deductions) || 0
    const netSalary = basicSalary + allowances - deductions

    const updateData: any = {
      ...body,
      basicSalary: basicSalary.toString(),
      allowances: allowances.toString(),
      deductions: deductions.toString(),
      netSalary: netSalary.toString(),
      updatedAt: new Date(),
    }
    delete updateData.id; delete updateData.createdAt; delete updateData.employeeId

    const [updated] = await db.update(payroll).set(updateData).where(eq(payroll.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT payroll error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    await db.delete(payroll).where(eq(payroll.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE payroll error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const body = await req.json()

    const [updated] = await db.update(payroll).set({
      status: body.status || 'paid',
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: body.paymentMethod || null,
      updatedAt: new Date(),
    }).where(eq(payroll.id, id)).returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH payroll error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
