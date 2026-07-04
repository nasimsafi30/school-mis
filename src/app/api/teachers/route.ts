import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachers, users } from '@/lib/db/schema'
import { eq, like, or, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit
    const whereConditions: any[] = []
    if (search) {
      whereConditions.push(or(
        like(teachers.firstName, '%' + search + '%'),
        like(teachers.lastName, '%' + search + '%'),
        like(teachers.email, '%' + search + '%'),
        like(teachers.employeeId, '%' + search + '%')
      ))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    const allTeachers = await db.query.teachers.findMany({
      where: whereClause,
      with: { department: { columns: { id: true, name: true } } },
      limit, offset,
      orderBy: [desc(teachers.createdAt)],
    })

    const totalCount = await db.$count(teachers)

    return NextResponse.json({
      data: allTeachers,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('Creating teacher:', body)

    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.dateOfBirth || !body.joiningDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exists = await db.query.users.findFirst({ where: eq(users.email, body.email) })
    if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

    const employeeId = 'EMP' + new Date().getFullYear() + nanoid(4).toUpperCase()
    const hash = await bcrypt.hash('teacher123', 12)
    const [user] = await db.insert(users).values({ email: body.email, password: hash, role: 'teacher', isActive: true }).returning()

    const [teacher] = await db.insert(teachers).values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender || 'male',
      employeeId: employeeId,
      joiningDate: body.joiningDate,
      qualification: body.qualification || null,
      designation: body.designation || null,
      departmentId: body.departmentId || null,
      salary: body.salary ? String(body.salary) : null,
      address: body.address || null,
      status: 'active',
      userId: user.id,
    }).returning()

    return NextResponse.json({ success: true, data: teacher }, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
