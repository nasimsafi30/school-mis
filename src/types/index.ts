export interface Student {
  id: string
  admissionNo: string
  rollNo?: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  email?: string
  phone?: string
  address?: string
  classId?: string
  sectionId?: string
  admissionDate: string
  admissionStatus: 'pending' | 'approved' | 'enrolled' | 'transferred' | 'graduated'
}

export interface Teacher {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  qualification?: string
  designation?: string
  joiningDate: string
  salary?: number
}

export interface Class {
  id: string
  name: string
  numericName?: number
  description?: string
  capacity?: number
  sections?: Section[]
}

export interface Section {
  id: string
  name: string
  classId: string
  capacity?: number
  roomNo?: string
}

export interface Subject {
  id: string
  name: string
  code: string
  classId: string
  teacherId?: string
}

export interface Exam {
  id: string
  name: string
  type: string
  classId: string
  subjectId: string
  date: string
  totalMarks: number
  passingMarks: number
  academicYear: string
}

export interface Result {
  id: string
  studentId: string
  examId: string
  subjectId: string
  marksObtained: number
  grade?: string
}

export interface Fee {
  id: string
  studentId: string
  feeType: string
  amount: number
  paidAmount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  academicYear: string
}

export interface Book {
  id: string
  isbn: string
  title: string
  author: string
  totalCopies: number
  availableCopies: number
  category?: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
}

export interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}
