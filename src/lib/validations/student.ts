import { z } from 'zod'

export const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
  address: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medicalInfo: z.string().optional(),
  previousSchool: z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentSchema>
