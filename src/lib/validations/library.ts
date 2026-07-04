import { z } from 'zod'

export const bookSchema = z.object({
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  totalCopies: z.number().min(1, 'Must have at least 1 copy'),
  availableCopies: z.number().min(0),
  shelfNo: z.string().optional(),
  price: z.number().min(0).optional(),
  publishedYear: z.number().optional(),
})

export type BookFormData = z.infer<typeof bookSchema>

export const issueBookSchema = z.object({
  bookId: z.string().min(1, 'Book is required'),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
})

export type IssueBookFormData = z.infer<typeof issueBookSchema>
