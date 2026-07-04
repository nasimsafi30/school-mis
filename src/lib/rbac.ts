import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian'

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  principal: [
    'dashboard.view',
    'students.view', 'students.create', 'students.edit', 'students.delete',
    'teachers.view', 'teachers.create', 'teachers.edit',
    'attendance.view', 'attendance.mark',
    'exams.view', 'exams.create', 'exams.edit',
    'results.view', 'results.create',
    'reports.view',
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'timetable.view', 'timetable.create', 'timetable.edit',
    'notifications.view',
  ],
  teacher: [
    'dashboard.view',
    'students.view',
    'attendance.view', 'attendance.mark',
    'exams.view', 'exams.create',
    'results.view', 'results.create',
    'timetable.view',
    'events.view',
    'notifications.view',
  ],
  student: [
    'dashboard.view',
    'timetable.view',
    'results.view',
    'events.view',
    'notifications.view',
  ],
  parent: [
    'dashboard.view',
    'students.view',
    'results.view',
    'fees.view',
    'notifications.view',
  ],
  accountant: [
    'dashboard.view',
    'fees.view', 'fees.create', 'fees.edit',
    'payroll.view', 'payroll.create', 'payroll.edit',
    'reports.view',
    'notifications.view',
  ],
  librarian: [
    'dashboard.view',
    'library.view', 'library.create', 'library.edit', 'library.delete',
    'notifications.view',
  ],
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole]
  if (!permissions) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}

export async function checkPermission(permission: string) {
  const session = await auth()
  if (!session?.user) return false
  return hasPermission(session.user.role as UserRole, permission)
}

export async function requirePermission(permission: string) {
  const hasAccess = await checkPermission(permission)
  if (!hasAccess) {
    redirect('/unauthorized')
  }
}
