'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const bookSchema = z.object({
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  totalCopies: z.number().min(1, 'Must have at least 1 copy'),
  shelfNo: z.string().optional(),
  price: z.number().min(0).optional(),
  publishedYear: z.number().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

const BOOK_CATEGORIES = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Computer Science', 'Physics', 'Chemistry', 'Biology',
  'Literature', 'Art', 'Music', 'Physical Education',
  'General Knowledge', 'Reference', 'Fiction', 'Non-Fiction', 'Other',
]

interface BookFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function BookForm({ initialData, onSuccess }: BookFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: initialData || {
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      edition: '',
      category: '',
      totalCopies: 1,
      shelfNo: '',
      price: 0,
      publishedYear: new Date().getFullYear(),
    },
  })

  const onSubmit = async (data: BookFormData) => {
    try {
      const url = isEditing ? '/api/books/' + initialData.id : '/api/books'
      const method = isEditing ? 'PUT' : 'POST'

      const payload = {
        ...data,
        availableCopies: isEditing
          ? data.totalCopies - (initialData.totalCopies - initialData.availableCopies)
          : data.totalCopies,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Book updated' : 'Book added')
        onSuccess?.()
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save book')
      }
    } catch (error) {
      toast.error('Failed to save book')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <Label>ISBN *</Label>
              <Input {...register('isbn')} placeholder='978-1234567890' disabled={isEditing} />
              {errors.isbn && <p className='text-sm text-red-500 mt-1'>{errors.isbn.message}</p>}
            </div>
            <div className='col-span-2'>
              <Label>Title *</Label>
              <Input {...register('title')} placeholder='Book title' />
              {errors.title && <p className='text-sm text-red-500 mt-1'>{errors.title.message}</p>}
            </div>
            <div>
              <Label>Author *</Label>
              <Input {...register('author')} placeholder='Author name' />
              {errors.author && <p className='text-sm text-red-500 mt-1'>{errors.author.message}</p>}
            </div>
            <div>
              <Label>Publisher</Label>
              <Input {...register('publisher')} placeholder='Publisher name' />
            </div>
            <div>
              <Label>Edition</Label>
              <Input {...register('edition')} placeholder='e.g., 2nd Edition' />
            </div>
            <div>
              <Label>Category</Label>
              <Select onValueChange={(value) => setValue('category', value)} defaultValue={watch('category')}>
                <SelectTrigger><SelectValue placeholder='Select category' /></SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total Copies *</Label>
              <Input type='number' min='1' {...register('totalCopies', { valueAsNumber: true })} />
              {errors.totalCopies && <p className='text-sm text-red-500 mt-1'>{errors.totalCopies.message}</p>}
            </div>
            <div>
              <Label>Shelf No</Label>
              <Input {...register('shelfNo')} placeholder='e.g., A1-B2' />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input type='number' step='0.01' min='0' {...register('price', { valueAsNumber: true })} placeholder='0.00' />
            </div>
            <div>
              <Label>Published Year</Label>
              <Input type='number' {...register('publishedYear', { valueAsNumber: true })} placeholder={new Date().getFullYear().toString()} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  )
}