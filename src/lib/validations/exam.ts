import { z } from 'zod'

export const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  type: z.enum(['mid_term', 'final', 'quiz', 'assignment', 'practical']),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(1, 'Passing marks must be at least 1'),
  academicYear: z.string().min(1, 'Academic year is required'),
  description: z.string().optional(),
})

export type ExamFormData = z.infer<typeof examSchema>
