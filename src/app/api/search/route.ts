import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { students, teachers, books, classes, subjects, events } from '@/lib/db/schema'
import { or, ilike, eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, students, teachers, books, classes, events
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({
        students: [],
        teachers: [],
        books: [],
        classes: [],
        events: [],
        total: 0,
      })
    }

    const searchTerm = `%${query}%`

    // Search results
    let studentResults: any[] = []
    let teacherResults: any[] = []
    let bookResults: any[] = []
    let classResults: any[] = []
    let eventResults: any[] = []

    // Search Students
    if (type === 'all' || type === 'students') {
      studentResults = await db.query.students.findMany({
        where: or(
          ilike(students.firstName, searchTerm),
          ilike(students.lastName, searchTerm),
          ilike(students.admissionNo, searchTerm),
          ilike(students.rollNo, searchTerm),
          ilike(students.email, searchTerm),
          ilike(students.phone, searchTerm)
        ),
        with: {
          class: {
            columns: { id: true, name: true },
          },
          section: {
            columns: { id: true, name: true },
          },
        },
        limit,
        orderBy: (students: any, { asc }: any) => [asc(students.firstName)],
      })
    }

    // Search Teachers
    if (type === 'all' || type === 'teachers') {
      teacherResults = await db.query.teachers.findMany({
        where: or(
          ilike(teachers.firstName, searchTerm),
          ilike(teachers.lastName, searchTerm),
          ilike(teachers.email, searchTerm),
          ilike(teachers.employeeId, searchTerm),
          ilike(teachers.phone, searchTerm),
          ilike(teachers.qualification, searchTerm),
          ilike(teachers.designation, searchTerm)
        ),
        with: {
          department: {
            columns: { id: true, name: true },
          },
        },
        limit,
        orderBy: (teachers: any, { asc }: any) => [asc(teachers.firstName)],
      })
    }

    // Search Books
    if (type === 'all' || type === 'books') {
      bookResults = await db.query.books.findMany({
        where: or(
          ilike(books.title, searchTerm),
          ilike(books.author, searchTerm),
          ilike(books.isbn, searchTerm),
          ilike(books.publisher, searchTerm),
          ilike(books.category, searchTerm)
        ),
        limit,
        orderBy: (books: any, { asc }: any) => [asc(books.title)],
      })
    }

    // Search Classes
    if (type === 'all' || type === 'classes') {
      classResults = await db.query.classes.findMany({
        where: or(
          ilike(classes.name, searchTerm),
          ilike(classes.description, searchTerm)
        ),
        limit,
        orderBy: (classes: any, { asc }: any) => [asc(classes.name)],
      })
    }

    // Search Events
    if (type === 'all' || type === 'events') {
      eventResults = await db.query.events.findMany({
        where: or(
          ilike(events.title, searchTerm),
          ilike(events.description, searchTerm),
          ilike(events.venue, searchTerm),
          ilike(events.organizer, searchTerm)
        ),
        limit,
        orderBy: (events: any, { asc }: any) => [asc(events.startDate)],
      })
    }

    // Calculate total results
    const total =
      studentResults.length +
      teacherResults.length +
      bookResults.length +
      classResults.length +
      eventResults.length

    // Format results for frontend
    const formattedStudents = studentResults.map((s: any) => ({
      id: s.id,
      type: 'student',
      title: `${s.firstName} ${s.lastName}`,
      subtitle: s.admissionNo,
      description: s.class?.name ? `${s.class.name}${s.section?.name ? ` - Section ${s.section.name}` : ''}` : '',
      link: `/students/${s.id}`,
      email: s.email,
      phone: s.phone,
      status: s.admissionStatus,
    }))

    const formattedTeachers = teacherResults.map((t: any) => ({
      id: t.id,
      type: 'teacher',
      title: `${t.firstName} ${t.lastName}`,
      subtitle: t.employeeId,
      description: t.designation || t.department?.name || '',
      link: `/teachers/${t.id}`,
      email: t.email,
      phone: t.phone,
      department: t.department?.name,
    }))

    const formattedBooks = bookResults.map((b: any) => ({
      id: b.id,
      type: 'book',
      title: b.title,
      subtitle: `by ${b.author}`,
      description: `ISBN: ${b.isbn} | Available: ${b.availableCopies}/${b.totalCopies}`,
      link: '/library',
      isbn: b.isbn,
      category: b.category,
      available: b.availableCopies > 0,
    }))

    const formattedClasses = classResults.map((c: any) => ({
      id: c.id,
      type: 'class',
      title: c.name,
      subtitle: c.description || '',
      description: `Capacity: ${c.capacity || 'N/A'}`,
      link: '/classes',
    }))

    const formattedEvents = eventResults.map((e: any) => ({
      id: e.id,
      type: 'event',
      title: e.title,
      subtitle: e.eventType,
      description: e.venue || e.organizer || '',
      link: '/events',
      date: e.startDate,
      status: e.status,
    }))

    return NextResponse.json({
      query,
      type,
      total,
      students: formattedStudents,
      teachers: formattedTeachers,
      books: formattedBooks,
      classes: formattedClasses,
      events: formattedEvents,
      // Also return raw format for backward compatibility
      raw: {
        students: studentResults,
        teachers: teacherResults,
        books: bookResults,
        classes: classResults,
        events: eventResults,
      },
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Search failed' },
      { status: 500 }
    )
  }
}