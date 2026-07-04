import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { students, users } from '@/lib/db/schema'
import { eq, like, or, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit
    const whereConditions: any[] = []
    if (search) {
      whereConditions.push(or(
        like(students.firstName, '%' + search + '%'),
        like(students.lastName, '%' + search + '%'),
        like(students.email, '%' + search + '%'),
        like(students.admissionNo, '%' + search + '%')
      ))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    const allStudents = await db.query.students.findMany({
      where: whereClause,
      with: { class: { columns: { id: true, name: true } }, section: { columns: { id: true, name: true } } },
      limit, offset,
      orderBy: [desc(students.createdAt)],
    })

    const totalCount = await db.$count(students)

    return NextResponse.json({
      data: allStudents,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.firstName || !body.lastName || !body.dateOfBirth || !body.gender || !body.admissionDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (body.email) {
      const exists = await db.query.users.findFirst({ where: eq(users.email, body.email) })
      if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const admissionNo = 'ADM' + new Date().getFullYear() + nanoid(6).toUpperCase()
    const rollNo = body.classId ? 'ROLL' + nanoid(4).toUpperCase() : null

    let userId: string | null = null
    if (body.email) {
      const hash = await bcrypt.hash(body.password || 'student123', 12)
      const [u] = await db.insert(users).values({ email: body.email, password: hash, role: 'student', isActive: true }).returning()
      userId = u.id
    }

    const [student] = await db.insert(students).values({
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: new Date(body.dateOfBirth).toISOString().split('T')[0],
      gender: body.gender,
      admissionNo: admissionNo,
      admissionDate: new Date(body.admissionDate).toISOString().split('T')[0],
      admissionStatus: 'enrolled',
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      classId: body.classId || null,
      sectionId: body.sectionId || null,
      rollNo: rollNo,
      bloodGroup: body.bloodGroup || null,
      medicalInfo: body.medicalInfo || null,
      previousSchool: body.previousSchool || null,
      parentId: body.parentId || null,
      userId: userId,
    }).returning()

    return NextResponse.json({ success: true, data: student }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
