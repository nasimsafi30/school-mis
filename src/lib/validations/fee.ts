import { z } from 'zod'

export const feeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  remarks: z.string().optional(),
  paymentMethod: z.string().optional(),
})

export type FeeFormData = z.infer<typeof feeSchema>
