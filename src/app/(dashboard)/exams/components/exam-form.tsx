'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const examSchema = z.object({
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

type ExamFormData = z.infer<typeof examSchema>

interface ExamFormProps {
  initialData?: any
  classes?: any[]
  subjects?: any[]
  onSuccess?: () => void
}

export function ExamForm({ initialData, classes = [], subjects = [], onSuccess }: ExamFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: initialData || {
      name: '',
      type: 'mid_term',
      classId: '',
      subjectId: '',
      date: '',
      startTime: '09:00',
      endTime: '11:00',
      totalMarks: 100,
      passingMarks: 40,
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      description: '',
    },
  })

  const selectedClass = watch('classId')
  const filteredSubjects = subjects.filter((s: any) => s.classId === selectedClass)

  const onSubmit = async (data: ExamFormData) => {
    try {
      const url = isEditing ? '/api/exams/' + initialData.id : '/api/exams'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Exam updated' : 'Exam created')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to save exam')
      }
    } catch (error) {
      toast.error('Failed to save exam')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Exam' : 'Create New Exam'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <Label htmlFor='name'>Exam Name *</Label>
              <Input id='name' {...register('name')} placeholder='e.g., Mid-Term Examination' />
              {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
            </div>

            <div>
              <Label>Exam Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={watch('type')}>
                <SelectTrigger><SelectValue placeholder='Select type' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='mid_term'>Mid Term</SelectItem>
                  <SelectItem value='final'>Final</SelectItem>
                  <SelectItem value='quiz'>Quiz</SelectItem>
                  <SelectItem value='assignment'>Assignment</SelectItem>
                  <SelectItem value='practical'>Practical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Academic Year *</Label>
              <Input {...register('academicYear')} placeholder='e.g., 2024-2025' />
              {errors.academicYear && <p className='text-sm text-red-500 mt-1'>{errors.academicYear.message}</p>}
            </div>

            <div>
              <Label>Class *</Label>
              <Select onValueChange={(value) => { setValue('classId', value); setValue('subjectId', '') }} defaultValue={watch('classId')}>
                <SelectTrigger><SelectValue placeholder='Select class' /></SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className='text-sm text-red-500 mt-1'>{errors.classId.message}</p>}
            </div>

            <div>
              <Label>Subject *</Label>
              <Select onValueChange={(value) => setValue('subjectId', value)} defaultValue={watch('subjectId')} disabled={!selectedClass}>
                <SelectTrigger><SelectValue placeholder='Select subject' /></SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className='text-sm text-red-500 mt-1'>{errors.subjectId.message}</p>}
            </div>

            <div>
              <Label htmlFor='date'>Date *</Label>
              <Input id='date' type='date' {...register('date')} />
              {errors.date && <p className='text-sm text-red-500 mt-1'>{errors.date.message}</p>}
            </div>

            <div>
              <Label htmlFor='startTime'>Start Time *</Label>
              <Input id='startTime' type='time' {...register('startTime')} />
              {errors.startTime && <p className='text-sm text-red-500 mt-1'>{errors.startTime.message}</p>}
            </div>

            <div>
              <Label htmlFor='endTime'>End Time *</Label>
              <Input id='endTime' type='time' {...register('endTime')} />
              {errors.endTime && <p className='text-sm text-red-500 mt-1'>{errors.endTime.message}</p>}
            </div>

            <div>
              <Label htmlFor='totalMarks'>Total Marks *</Label>
              <Input id='totalMarks' type='number' {...register('totalMarks', { valueAsNumber: true })} />
              {errors.totalMarks && <p className='text-sm text-red-500 mt-1'>{errors.totalMarks.message}</p>}
            </div>

            <div>
              <Label htmlFor='passingMarks'>Passing Marks *</Label>
              <Input id='passingMarks' type='number' {...register('passingMarks', { valueAsNumber: true })} />
              {errors.passingMarks && <p className='text-sm text-red-500 mt-1'>{errors.passingMarks.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea id='description' {...register('description')} placeholder='Exam description or instructions' rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Exam' : 'Create Exam'}
        </Button>
      </div>
    </form>
  )
}