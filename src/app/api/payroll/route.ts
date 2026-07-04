import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payroll } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const records = await db.query.payroll.findMany({
      with: { employee: true },
      orderBy: [desc(payroll.year), desc(payroll.month)],
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (!body.employeeId || !body.month || !body.year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const basicSalary = Number(body.basicSalary) || 0
    const allowances = Number(body.allowances) || 0
    const deductions = Number(body.deductions) || 0
    const netSalary = basicSalary + allowances - deductions

    // Check for existing payroll
    const existing = await db.query.payroll.findFirst({
      where: and(
        eq(payroll.employeeId, body.employeeId),
        eq(payroll.month, body.month),
        eq(payroll.year, body.year)
      ),
    })

    // Update if exists, create if not
    if (existing) {
      const [updated] = await db.update(payroll).set({
        basicSalary: basicSalary.toString(),
        allowances: allowances.toString(),
        deductions: deductions.toString(),
        netSalary: netSalary.toString(),
        updatedAt: new Date(),
      }).where(eq(payroll.id, existing.id)).returning()
      return NextResponse.json(updated)
    }

    const [record] = await db.insert(payroll).values({
      employeeId: body.employeeId,
      month: body.month,
      year: body.year,
      basicSalary: basicSalary.toString(),
      allowances: allowances.toString(),
      deductions: deductions.toString(),
      netSalary: netSalary.toString(),
      status: 'pending',
    }).returning()

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('POST payroll error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
