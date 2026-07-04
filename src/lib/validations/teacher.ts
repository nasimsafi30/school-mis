import { z } from 'zod'

export const teacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  qualification: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  salary: z.number().min(0).optional(),
  address: z.string().optional(),
  departmentId: z.string().optional(),
})

export type TeacherFormData = z.infer<typeof teacherSchema>
