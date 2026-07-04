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

const studentSchema = z.object({
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

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  initialData?: any
  classes?: any[]
  sections?: any[]
  onSuccess?: () => void
}

export function StudentForm({ initialData, classes = [], sections = [], onSuccess }: StudentFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      email: '',
      phone: '',
      address: '',
      classId: '',
      sectionId: '',
      admissionDate: new Date().toISOString().split('T')[0],
      medicalInfo: '',
      previousSchool: '',
    },
  })

  const selectedClassId = watch('classId')
  const filteredSections = sections.filter((s: any) => s.classId === selectedClassId)

  const onSubmit = async (data: StudentFormData) => {
    try {
      const url = isEditing ? '/api/students/' + initialData.id : '/api/students'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Student updated successfully' : 'Student created successfully')
        onSuccess?.()
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save student')
      }
    } catch (error) {
      toast.error('Failed to save student')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='firstName'>First Name *</Label>
            <Input id='firstName' {...register('firstName')} placeholder='Enter first name' />
            {errors.firstName && <p className='text-sm text-red-500 mt-1'>{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor='lastName'>Last Name *</Label>
            <Input id='lastName' {...register('lastName')} placeholder='Enter last name' />
            {errors.lastName && <p className='text-sm text-red-500 mt-1'>{errors.lastName.message}</p>}
          </div>
          <div>
            <Label htmlFor='dateOfBirth'>Date of Birth *</Label>
            <Input id='dateOfBirth' type='date' {...register('dateOfBirth')} />
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
            {errors.gender && <p className='text-sm text-red-500 mt-1'>{errors.gender.message}</p>}
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' {...register('email')} placeholder='Enter email' />
            {errors.email && <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor='phone'>Phone</Label>
            <Input id='phone' {...register('phone')} placeholder='Enter phone number' />
            {errors.phone && <p className='text-sm text-red-500 mt-1'>{errors.phone.message}</p>}
          </div>
          <div>
            <Label>Blood Group</Label>
            <Select onValueChange={(value) => setValue('bloodGroup', value as any)} defaultValue={watch('bloodGroup')}>
              <SelectTrigger><SelectValue placeholder='Select blood group' /></SelectTrigger>
              <SelectContent>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label>Class *</Label>
            <Select onValueChange={(value) => { setValue('classId', value); setValue('sectionId', '') }} defaultValue={watch('classId')}>
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
            <Label>Section *</Label>
            <Select onValueChange={(value) => setValue('sectionId', value)} defaultValue={watch('sectionId')} disabled={!selectedClassId}>
              <SelectTrigger><SelectValue placeholder='Select section' /></SelectTrigger>
              <SelectContent>
                {filteredSections.map((sec: any) => (
                  <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sectionId && <p className='text-sm text-red-500 mt-1'>{errors.sectionId.message}</p>}
          </div>
          <div>
            <Label htmlFor='admissionDate'>Admission Date *</Label>
            <Input id='admissionDate' type='date' {...register('admissionDate')} />
            {errors.admissionDate && <p className='text-sm text-red-500 mt-1'>{errors.admissionDate.message}</p>}
          </div>
          <div>
            <Label htmlFor='previousSchool'>Previous School</Label>
            <Input id='previousSchool' {...register('previousSchool')} placeholder='Previous school name' />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='address'>Address</Label>
            <Textarea id='address' {...register('address')} placeholder='Enter address' rows={3} />
          </div>
          <div>
            <Label htmlFor='medicalInfo'>Medical Information</Label>
            <Textarea id='medicalInfo' {...register('medicalInfo')} placeholder='Any medical conditions or allergies' rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  )
}