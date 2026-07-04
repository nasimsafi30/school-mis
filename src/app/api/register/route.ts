import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, students, teachers, parents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, role } = body

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (existingUser) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 12)
    const [user] = await db.insert(users).values({ email, password: hashedPassword, role, isActive: true }).returning()

    if (role === 'teacher') {
      await db.insert(teachers).values({
        employeeId: 'EMP' + new Date().getFullYear() + String(Date.now()).slice(-4),
        firstName, lastName, email, phone: phone || '',
        dateOfBirth: new Date().toISOString().split('T')[0],
        gender: 'other',
        joiningDate: new Date().toISOString().split('T')[0],
      })
    } else if (role === 'student') {
      await db.insert(students).values({
        admissionNo: 'ADM' + new Date().getFullYear() + String(Date.now()).slice(-6),
        firstName, lastName, email, phone: phone || '',
        dateOfBirth: new Date().toISOString().split('T')[0],
        gender: 'other',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionStatus: 'pending',
      })
    } else if (role === 'parent') {
      await db.insert(parents).values({
        fatherName: firstName + ' ' + lastName,
        fatherPhone: phone || '',
        fatherEmail: email,
      })
    }

    return NextResponse.json({ success: true, message: 'Account created', user: { id: user.id, email: user.email, role: user.role } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}