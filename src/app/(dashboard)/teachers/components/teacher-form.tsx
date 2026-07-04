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

const teacherSchema = z.object({
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

type TeacherFormData = z.infer<typeof teacherSchema>

interface TeacherFormProps {
  initialData?: any
  departments?: any[]
  onSuccess?: () => void
}

export function TeacherForm({ initialData, departments = [], onSuccess }: TeacherFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      qualification: '',
      designation: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0,
      address: '',
      departmentId: '',
    },
  })

  const onSubmit = async (data: TeacherFormData) => {
    try {
      const url = isEditing ? '/api/teachers/' + initialData.id : '/api/teachers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Teacher updated' : 'Teacher created')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to save teacher')
      }
    } catch (error) {
      toast.error('Failed to save teacher')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label>First Name *</Label>
            <Input {...register('firstName')} placeholder='Enter first name' />
            {errors.firstName && <p className='text-sm text-red-500 mt-1'>{errors.firstName.message}</p>}
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input {...register('lastName')} placeholder='Enter last name' />
            {errors.lastName && <p className='text-sm text-red-500 mt-1'>{errors.lastName.message}</p>}
          </div>
          <div>
            <Label>Email *</Label>
            <Input type='email' {...register('email')} placeholder='Enter email' />
            {errors.email && <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>}
          </div>
          <div>
            <Label>Phone *</Label>
            <Input {...register('phone')} placeholder='Enter phone' />
            {errors.phone && <p className='text-sm text-red-500 mt-1'>{errors.phone.message}</p>}
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Input type='date' {...register('dateOfBirth')} />
            {errors.dateOfBirth && <p className='text-sm text-red-500 mt-1'>{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <Label>Gender *</Label>
            <Select onValueChange={(value) => setValue('gender', value as any)} defaultValue={watch('gender')}>
              <SelectTrigger><SelectValue placeholder='Select gender' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='male'>Male</SelectItem>
                <SelectItem value='female'>Female</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label>Qualification</Label>
            <Input {...register('qualification')} placeholder='e.g., Ph.D. Mathematics' />
          </div>
          <div>
            <Label>Designation</Label>
            <Input {...register('designation')} placeholder='e.g., Senior Teacher' />
          </div>
          <div>
            <Label>Joining Date *</Label>
            <Input type='date' {...register('joiningDate')} />
            {errors.joiningDate && <p className='text-sm text-red-500 mt-1'>{errors.joiningDate.message}</p>}
          </div>
          <div>
            <Label>Salary</Label>
            <Input type='number' {...register('salary', { valueAsNumber: true })} placeholder='Annual salary' />
          </div>
          <div>
            <Label>Department</Label>
            <Select onValueChange={(value) => setValue('departmentId', value)} defaultValue={watch('departmentId')}>
              <SelectTrigger><SelectValue placeholder='Select department' /></SelectTrigger>
              <SelectContent>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent>
          <Textarea {...register('address')} placeholder='Enter address' rows={3} />
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Teacher' : 'Add Teacher'}
        </Button>
      </div>
    </form>
  )
}
