import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  date,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core'
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'principal',
  'teacher',
  'student',
  'parent',
  'accountant',
  'librarian',
  'receptionist',
])

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'other',
])

export const bloodGroupEnum = pgEnum('blood_group', [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
])

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'half_day',
])

export const examTypeEnum = pgEnum('exam_type', [
  'mid_term',
  'final',
  'quiz',
  'assignment',
  'practical',
])

export const feeStatusEnum = pgEnum('fee_status', [
  'paid',
  'pending',
  'partial',
  'overdue',
])

export const admissionStatusEnum = pgEnum('admission_status', [
  'pending',
  'approved',
  'rejected',
  'enrolled',
  'transferred',
  'graduated',
])

export const bookStatusEnum = pgEnum('book_status', [
  'available',
  'issued',
  'lost',
  'damaged',
])

export const payrollStatusEnum = pgEnum('payroll_status', [
  'pending',
  'processed',
  'paid',
  'cancelled',
])

export const teacherStatusEnum = pgEnum('teacher_status', [
  'active',
  'on_leave',
  'inactive',
  'retired',
])

export const eventStatusEnum = pgEnum('event_status', [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
])

// ============================================
// USERS TABLE
// ============================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: timestamp('last_login'),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  activeIdx: index('users_active_idx').on(table.isActive),
}))

// ============================================
// SCHOOLS TABLE
// ============================================
export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 20 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  website: varchar('website', { length: 255 }),
  logo: text('logo'),
  affiliation: varchar('affiliation', { length: 255 }),
  established: date('established'),
  principalName: varchar('principal_name', { length: 255 }),
  schoolType: varchar('school_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// DEPARTMENTS TABLE
// ============================================
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  headId: uuid('head_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('departments_code_idx').on(table.code),
}))

// ============================================
// CLASSES TABLE
// ============================================
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  numericName: integer('numeric_name'),
  description: text('description'),
  capacity: integer('capacity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('classes_name_idx').on(table.name),
}))

// ============================================
// SECTIONS TABLE
// ============================================
export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 10 }).notNull(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  capacity: integer('capacity'),
  roomNo: varchar('room_no', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  classIdx: index('sections_class_idx').on(table.classId),
}))

// ============================================
// TEACHERS TABLE
// ============================================
export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  bloodGroup: bloodGroupEnum('blood_group'),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  pincode: varchar('pincode', { length: 20 }),
  profileImage: text('profile_image'),
  qualification: varchar('qualification', { length: 255 }),
  specialization: varchar('specialization', { length: 255 }),
  experience: integer('experience'),
  joiningDate: date('joining_date').notNull(),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  designation: varchar('designation', { length: 100 }),
  departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
  isClassTeacher: boolean('is_class_teacher').default(false),
  classTeacherOf: uuid('class_teacher_of').references(() => classes.id, { onDelete: 'set null' }),
  status: teacherStatusEnum('status').default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  employeeIdIdx: uniqueIndex('teachers_employee_id_idx').on(table.employeeId),
  emailIdx: index('teachers_email_idx').on(table.email),
  departmentIdx: index('teachers_department_idx').on(table.departmentId),
  statusIdx: index('teachers_status_idx').on(table.status),
}))

// ============================================
// PARENTS TABLE
// ============================================
export const parents = pgTable('parents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  fatherName: varchar('father_name', { length: 255 }),
  motherName: varchar('mother_name', { length: 255 }),
  guardianName: varchar('guardian_name', { length: 255 }),
  fatherOccupation: varchar('father_occupation', { length: 255 }),
  motherOccupation: varchar('mother_occupation', { length: 255 }),
  fatherPhone: varchar('father_phone', { length: 20 }),
  motherPhone: varchar('mother_phone', { length: 20 }),
  fatherEmail: varchar('father_email', { length: 255 }),
  motherEmail: varchar('mother_email', { length: 255 }),
  address: text('address'),
  annualIncome: decimal('annual_income', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// STUDENTS TABLE
// ============================================
export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  admissionNo: varchar('admission_no', { length: 50 }).notNull().unique(),
  rollNo: varchar('roll_no', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  bloodGroup: bloodGroupEnum('blood_group'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  pincode: varchar('pincode', { length: 20 }),
  profileImage: text('profile_image'),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }),
  sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'set null' }),
  admissionDate: date('admission_date').notNull(),
  admissionStatus: admissionStatusEnum('admission_status').default('pending'),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'set null' }),
  medicalInfo: text('medical_info'),
  previousSchool: varchar('previous_school', { length: 255 }),
  transportId: uuid('transport_id'),
  hostelId: uuid('hostel_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  admissionNoIdx: uniqueIndex('students_admission_no_idx').on(table.admissionNo),
  classIdx: index('students_class_idx').on(table.classId),
  sectionIdx: index('students_section_idx').on(table.sectionId),
  parentIdx: index('students_parent_idx').on(table.parentId),
  statusIdx: index('students_status_idx').on(table.admissionStatus),
  emailIdx: index('students_email_idx').on(table.email),
}))

// ============================================
// SUBJECTS TABLE
// ============================================
export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  description: text('description'),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  isOptional: boolean('is_optional').default(false),
  credits: integer('credits'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('subjects_code_idx').on(table.code),
  classIdx: index('subjects_class_idx').on(table.classId),
  teacherIdx: index('subjects_teacher_idx').on(table.teacherId),
}))

// ============================================
// ATTENDANCE TABLE
// ============================================
export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  status: attendanceStatusEnum('status').notNull(),
  reason: text('reason'),
  markedBy: uuid('marked_by').references(() => teachers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentDateIdx: uniqueIndex('attendance_student_date_idx').on(table.studentId, table.date),
  classDateIdx: index('attendance_class_date_idx').on(table.classId, table.date),
  statusIdx: index('attendance_status_idx').on(table.status),
}))

// ============================================
// EXAMS TABLE
// ============================================
export const exams = pgTable('exams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: examTypeEnum('type').notNull(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  totalMarks: integer('total_marks').notNull(),
  passingMarks: integer('passing_marks').notNull(),
  description: text('description'),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  status: eventStatusEnum('status').default('upcoming'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  classIdx: index('exams_class_idx').on(table.classId),
  subjectIdx: index('exams_subject_idx').on(table.subjectId),
  dateIdx: index('exams_date_idx').on(table.date),
  statusIdx: index('exams_status_idx').on(table.status),
}))

// ============================================
// RESULTS TABLE
// ============================================
export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  examId: uuid('exam_id').references(() => exams.id, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  marksObtained: decimal('marks_obtained', { precision: 5, scale: 2 }).notNull(),
  grade: varchar('grade', { length: 5 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentExamIdx: uniqueIndex('results_student_exam_idx').on(table.studentId, table.examId),
  examIdx: index('results_exam_idx').on(table.examId),
  studentIdx: index('results_student_idx').on(table.studentId),
}))

// ============================================
// FEES TABLE
// ============================================
export const fees = pgTable('fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  feeType: varchar('fee_type', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  status: feeStatusEnum('status').default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 100 }),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentIdx: index('fees_student_idx').on(table.studentId),
  statusIdx: index('fees_status_idx').on(table.status),
  dueDateIdx: index('fees_due_date_idx').on(table.dueDate),
}))

// ============================================
// TIMETABLE TABLE
// ============================================
export const timetable = pgTable('timetable', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  roomNo: varchar('room_no', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  classSectionIdx: index('timetable_class_section_idx').on(table.classId, table.sectionId),
  teacherIdx: index('timetable_teacher_idx').on(table.teacherId),
  dayIdx: index('timetable_day_idx').on(table.dayOfWeek),
}))

// ============================================
// EVENTS TABLE
// ============================================
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 50 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  venue: varchar('venue', { length: 255 }),
  organizer: varchar('organizer', { length: 255 }),
  isAllDay: boolean('is_all_day').default(false),
  isFeatured: boolean('is_featured').default(false),
  notifyBefore: integer('notify_before'), // minutes before event
  status: eventStatusEnum('status').default('upcoming'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('events_date_idx').on(table.startDate),
  statusIdx: index('events_status_idx').on(table.status),
  featuredIdx: index('events_featured_idx').on(table.isFeatured),
}))

// ============================================
// BOOKS TABLE
// ============================================
export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  isbn: varchar('isbn', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  publisher: varchar('publisher', { length: 255 }),
  edition: varchar('edition', { length: 50 }),
  category: varchar('category', { length: 100 }),
  totalCopies: integer('total_copies').notNull(),
  availableCopies: integer('available_copies').notNull(),
  shelfNo: varchar('shelf_no', { length: 20 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  publishedYear: integer('published_year'),
  status: bookStatusEnum('status').default('available'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  isbnIdx: uniqueIndex('books_isbn_idx').on(table.isbn),
  titleIdx: index('books_title_idx').on(table.title),
  authorIdx: index('books_author_idx').on(table.author),
  categoryIdx: index('books_category_idx').on(table.category),
}))

// ============================================
// ISSUED BOOKS TABLE
// ============================================
export const issuedBooks = pgTable('issued_books', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'set null' }),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  returnDate: date('return_date'),
  fine: decimal('fine', { precision: 10, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('issued'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  bookIdx: index('issued_books_book_idx').on(table.bookId),
  studentIdx: index('issued_books_student_idx').on(table.studentId),
  statusIdx: index('issued_books_status_idx').on(table.status),
  dueDateIdx: index('issued_books_due_date_idx').on(table.dueDate),
}))

// ============================================
// TRANSPORT TABLE
// ============================================
export const transport = pgTable('transport', {
  id: uuid('id').defaultRandom().primaryKey(),
  routeName: varchar('route_name', { length: 100 }).notNull(),
  routeNo: varchar('route_no', { length: 20 }).notNull().unique(),
  vehicleNo: varchar('vehicle_no', { length: 20 }).notNull(),
  driverName: varchar('driver_name', { length: 255 }).notNull(),
  driverPhone: varchar('driver_phone', { length: 20 }).notNull(),
  capacity: integer('capacity').notNull(),
  occupied: integer('occupied').default(0),
  stops: text('stops'),
  fee: decimal('fee', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  routeNoIdx: uniqueIndex('transport_route_no_idx').on(table.routeNo),
}))

// ============================================
// HOSTELS TABLE
// ============================================
export const hostels = pgTable('hostels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // boys, girls
  wardenName: varchar('warden_name', { length: 255 }),
  wardenPhone: varchar('warden_phone', { length: 20 }),
  capacity: integer('capacity').notNull(),
  occupied: integer('occupied').default(0),
  fee: decimal('fee', { precision: 10, scale: 2 }),
  address: text('address'),
  facilities: text('facilities'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// PAYROLL TABLE
// ============================================
export const payroll = pgTable('payroll', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => teachers.id, { onDelete: 'cascade' }).notNull(),
  month: varchar('month', { length: 20 }).notNull(),
  year: integer('year').notNull(),
  basicSalary: decimal('basic_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: decimal('allowances', { precision: 10, scale: 2 }).default('0'),
  deductions: decimal('deductions', { precision: 10, scale: 2 }).default('0'),
  netSalary: decimal('net_salary', { precision: 10, scale: 2 }).notNull(),
  status: payrollStatusEnum('status').default('pending'),
  paymentDate: date('payment_date'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  employeeMonthIdx: uniqueIndex('payroll_employee_month_idx').on(table.employeeId, table.month, table.year),
  statusIdx: index('payroll_status_idx').on(table.status),
}))

// ============================================
// NOTIFICATIONS TABLE
// ============================================
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }),
  isRead: boolean('is_read').default(false),
  link: varchar('link', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  readIdx: index('notifications_read_idx').on(table.isRead),
  typeIdx: index('notifications_type_idx').on(table.type),
}))

// ============================================
// RELATIONS
// ============================================

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
  parent: one(parents, {
    fields: [users.id],
    references: [parents.userId],
  }),
  notifications: many(notifications),
}))

// Students Relations
export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  section: one(sections, {
    fields: [students.sectionId],
    references: [sections.id],
  }),
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  attendance: many(attendance),
  results: many(results),
  fees: many(fees),
  issuedBooks: many(issuedBooks),
}))

// Teachers Relations
export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [teachers.departmentId],
    references: [departments.id],
  }),
  classTeacherOf: one(classes, {
    fields: [teachers.classTeacherOf],
    references: [classes.id],
  }),
  subjects: many(subjects),
  payroll: many(payroll),
  issuedBooks: many(issuedBooks),
}))

// Parents Relations
export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  students: many(students),
}))

// Classes Relations
export const classesRelations = relations(classes, ({ many }) => ({
  sections: many(sections),
  students: many(students),
  subjects: many(subjects),
  exams: many(exams),
  attendance: many(attendance),
  timetable: many(timetable),
}))

// Sections Relations
export const sectionsRelations = relations(sections, ({ one }) => ({
  class: one(classes, {
    fields: [sections.classId],
    references: [classes.id],
  }),
}))

// Departments Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  teachers: many(teachers),
}))

// Subjects Relations
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, {
    fields: [subjects.classId],
    references: [classes.id],
  }),
  teacher: one(teachers, {
    fields: [subjects.teacherId],
    references: [teachers.id],
  }),
  exams: many(exams),
  results: many(results),
  timetable: many(timetable),
}))

// Attendance Relations
export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  markedByTeacher: one(teachers, {
    fields: [attendance.markedBy],
    references: [teachers.id],
  }),
}))

// Exams Relations
export const examsRelations = relations(exams, ({ one, many }) => ({
  class: one(classes, {
    fields: [exams.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [exams.subjectId],
    references: [subjects.id],
  }),
  results: many(results),
}))

// Results Relations
export const resultsRelations = relations(results, ({ one }) => ({
  student: one(students, {
    fields: [results.studentId],
    references: [students.id],
  }),
  exam: one(exams, {
    fields: [results.examId],
    references: [exams.id],
  }),
  subject: one(subjects, {
    fields: [results.subjectId],
    references: [subjects.id],
  }),
}))

// Fees Relations
export const feesRelations = relations(fees, ({ one }) => ({
  student: one(students, {
    fields: [fees.studentId],
    references: [students.id],
  }),
}))

// Timetable Relations
export const timetableRelations = relations(timetable, ({ one }) => ({
  class: one(classes, {
    fields: [timetable.classId],
    references: [classes.id],
  }),
  section: one(sections, {
    fields: [timetable.sectionId],
    references: [sections.id],
  }),
  subject: one(subjects, {
    fields: [timetable.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [timetable.teacherId],
    references: [teachers.id],
  }),
}))

// Books Relations
export const booksRelations = relations(books, ({ many }) => ({
  issuedBooks: many(issuedBooks),
}))

// Issued Books Relations
export const issuedBooksRelations = relations(issuedBooks, ({ one }) => ({
  book: one(books, {
    fields: [issuedBooks.bookId],
    references: [books.id],
  }),
  student: one(students, {
    fields: [issuedBooks.studentId],
    references: [students.id],
  }),
  teacher: one(teachers, {
    fields: [issuedBooks.teacherId],
    references: [teachers.id],
  }),
}))

// Payroll Relations
export const payrollRelations = relations(payroll, ({ one }) => ({
  employee: one(teachers, {
    fields: [payroll.employeeId],
    references: [teachers.id],
  }),
}))

// Notifications Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

// Transport Relations (if needed)
export const transportRelations = relations(transport, ({ many }) => ({
  // students: many(students), // Uncomment if you add transportId foreign key in students
}))

// Hostels Relations (if needed)
export const hostelsRelations = relations(hostels, ({ many }) => ({
  // students: many(students), // Uncomment if you add hostelId foreign key in students
}))

// ============================================
// TYPE EXPORTS
// ============================================

// User types
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

// Student types
export type Student = InferSelectModel<typeof students>
export type NewStudent = InferInsertModel<typeof students>

// Teacher types
export type Teacher = InferSelectModel<typeof teachers>
export type NewTeacher = InferInsertModel<typeof teachers>

// Parent types
export type Parent = InferSelectModel<typeof parents>
export type NewParent = InferInsertModel<typeof parents>

// Class types
export type Class = InferSelectModel<typeof classes>
export type NewClass = InferInsertModel<typeof classes>

// Section types
export type Section = InferSelectModel<typeof sections>
export type NewSection = InferInsertModel<typeof sections>

// Subject types
export type Subject = InferSelectModel<typeof subjects>
export type NewSubject = InferInsertModel<typeof subjects>

// Exam types
export type Exam = InferSelectModel<typeof exams>
export type NewExam = InferInsertModel<typeof exams>

// Result types
export type Result = InferSelectModel<typeof results>
export type NewResult = InferInsertModel<typeof results>

// Fee types
export type Fee = InferSelectModel<typeof fees>
export type NewFee = InferInsertModel<typeof fees>

// Attendance types
export type Attendance = InferSelectModel<typeof attendance>
export type NewAttendance = InferInsertModel<typeof attendance>

// Book types
export type Book = InferSelectModel<typeof books>
export type NewBook = InferInsertModel<typeof books>

// Issued Book types
export type IssuedBook = InferSelectModel<typeof issuedBooks>
export type NewIssuedBook = InferInsertModel<typeof issuedBooks>

// Payroll types
export type Payroll = InferSelectModel<typeof payroll>
export type NewPayroll = InferInsertModel<typeof payroll>

// Notification types
export type Notification = InferSelectModel<typeof notifications>
export type NewNotification = InferInsertModel<typeof notifications>

// Event types
export type Event = InferSelectModel<typeof events>
export type NewEvent = InferInsertModel<typeof events>

// Transport types
export type Transport = InferSelectModel<typeof transport>
export type NewTransport = InferInsertModel<typeof transport>

// Hostel types
export type Hostel = InferSelectModel<typeof hostels>
export type NewHostel = InferInsertModel<typeof hostels>

// Department types
export type Department = InferSelectModel<typeof departments>
export type NewDepartment = InferInsertModel<typeof departments>

// School types
export type School = InferSelectModel<typeof schools>
export type NewSchool = InferInsertModel<typeof schools>