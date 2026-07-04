import { z } from 'zod'

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  numericName: z.number().optional(),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
})

export type ClassFormData = z.infer<typeof classSchema>
