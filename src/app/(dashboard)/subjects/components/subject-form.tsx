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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(2, 'Subject code is required').max(10),
  description: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  teacherId: z.string().optional(),
  isOptional: z.boolean(),
  credits: z.number().min(0).optional(),
})

type SubjectFormData = z.infer<typeof subjectSchema>

interface SubjectFormProps {
  initialData?: any
  classes?: any[]
  teachers?: any[]
  onSuccess?: () => void
}

export function SubjectForm({ initialData, classes = [], teachers = [], onSuccess }: SubjectFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      classId: initialData?.classId || '',
      teacherId: initialData?.teacherId || '',
      isOptional: initialData?.isOptional ?? false,
      credits: initialData?.credits || undefined,
    },
  })

  const isOptional = watch('isOptional')

  const onSubmit = async (data: SubjectFormData) => {
    try {
      const url = isEditing ? '/api/subjects/' + initialData.id : '/api/subjects'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Subject updated' : 'Subject created')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to save subject')
      }
    } catch (error) {
      toast.error('Failed to save subject')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Subject Name *</Label>
              <Input id='name' {...register('name')} placeholder='e.g., Mathematics' />
              {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor='code'>Subject Code *</Label>
              <Input id='code' {...register('code')} placeholder='e.g., MATH101' />
              {errors.code && <p className='text-sm text-red-500 mt-1'>{errors.code.message}</p>}
            </div>
          </div>

          <div>
            <Label>Class *</Label>
            <Select onValueChange={(value) => setValue('classId', value)} defaultValue={watch('classId')}>
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
            <Label>Teacher</Label>
            <Select onValueChange={(value) => setValue('teacherId', value)} defaultValue={watch('teacherId')}>
              <SelectTrigger><SelectValue placeholder='Assign teacher (optional)' /></SelectTrigger>
              <SelectContent>
                <SelectItem value=''>None</SelectItem>
                {teachers.map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea id='description' {...register('description')} placeholder='Subject description' rows={3} />
          </div>

          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div>
              <Label>Optional Subject</Label>
              <p className='text-sm text-muted-foreground'>Mark this subject as optional for students</p>
            </div>
            <Switch
              checked={isOptional}
              onCheckedChange={(checked) => setValue('isOptional', checked)}
            />
          </div>

          <div>
            <Label htmlFor='credits'>Credits</Label>
            <Input id='credits' type='number' {...register('credits', { valueAsNumber: true })} placeholder='Number of credits' />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Subject' : 'Add Subject'}
        </Button>
      </div>
    </form>
  )
}