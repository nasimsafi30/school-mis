'use client'

import { useState } from 'react'
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
import { Loader2, Search } from 'lucide-react'

const feeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  remarks: z.string().optional(),
})

type FeeFormData = z.infer<typeof feeSchema>

const FEE_TYPES = [
  'Tuition Fee',
  'Admission Fee',
  'Exam Fee',
  'Library Fee',
  'Transport Fee',
  'Hostel Fee',
  'Sports Fee',
  'Computer Fee',
  'Development Fee',
  'Other',
]

interface FeeFormProps {
  initialData?: any
  students?: any[]
  onSuccess?: () => void
}

export function FeeForm({ initialData, students = [], onSuccess }: FeeFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  const [searchTerm, setSearchTerm] = useState('')
  const [showStudentList, setShowStudentList] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
    defaultValues: initialData || {
      studentId: '',
      feeType: '',
      amount: 0,
      dueDate: '',
      academicYear: '2024-2025',
      remarks: '',
    },
  })

  const filteredStudents = students.filter((s: any) => {
    if (!searchTerm) return false
    const search = searchTerm.toLowerCase()
    return (
      (s.firstName || '').toLowerCase().includes(search) ||
      (s.lastName || '').toLowerCase().includes(search) ||
      (s.admissionNo || '').toLowerCase().includes(search)
    )
  }).slice(0, 10)

  const selectedStudentId = watch('studentId')
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId)

  const onSubmit = async (data: FeeFormData) => {
    try {
      const url = isEditing ? '/api/fees/' + initialData.id : '/api/fees'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Fee record updated' : 'Fee record created')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to save fee record')
      }
    } catch (error) {
      toast.error('Failed to save fee record')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Fee Record' : 'Add New Fee Record'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Student *</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search student by name or admission number...'
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowStudentList(true) }}
                onFocus={() => setShowStudentList(true)}
                className='pl-10'
              />
            </div>
            {showStudentList && searchTerm && (
              <div className='mt-1 border rounded-md max-h-48 overflow-y-auto'>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className='p-3 hover:bg-accent cursor-pointer border-b last:border-b-0'
                      onClick={() => {
                        setValue('studentId', student.id)
                        setSearchTerm(student.firstName + ' ' + student.lastName + ' (' + student.admissionNo + ')')
                        setShowStudentList(false)
                      }}
                    >
                      <p className='font-medium'>{student.firstName} {student.lastName}</p>
                      <p className='text-xs text-muted-foreground'>{student.admissionNo} | {student.class?.name} {student.section?.name}</p>
                    </div>
                  ))
                ) : (
                  <p className='p-3 text-sm text-muted-foreground text-center'>No students found</p>
                )}
              </div>
            )}
            {selectedStudent && (
              <div className='mt-2 p-2 bg-muted rounded-md'>
                <p className='text-sm font-medium'>Selected: {selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p className='text-xs text-muted-foreground'>{selectedStudent.admissionNo} | {selectedStudent.class?.name}</p>
              </div>
            )}
            {errors.studentId && <p className='text-sm text-red-500 mt-1'>{errors.studentId.message}</p>}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Fee Type *</Label>
              <Select onValueChange={(value) => setValue('feeType', value)} defaultValue={watch('feeType')}>
                <SelectTrigger><SelectValue placeholder='Select fee type' /></SelectTrigger>
                <SelectContent>
                  {FEE_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                </SelectContent>
              </Select>
              {errors.feeType && <p className='text-sm text-red-500 mt-1'>{errors.feeType.message}</p>}
            </div>
            <div>
              <Label htmlFor='amount'>Amount *</Label>
              <Input id='amount' type='number' step='0.01' {...register('amount', { valueAsNumber: true })} placeholder='0.00' />
              {errors.amount && <p className='text-sm text-red-500 mt-1'>{errors.amount.message}</p>}
            </div>
            <div>
              <Label htmlFor='dueDate'>Due Date *</Label>
              <Input id='dueDate' type='date' {...register('dueDate')} />
              {errors.dueDate && <p className='text-sm text-red-500 mt-1'>{errors.dueDate.message}</p>}
            </div>
            <div>
              <Label htmlFor='academicYear'>Academic Year *</Label>
              <Input id='academicYear' {...register('academicYear')} placeholder='2024-2025' />
              {errors.academicYear && <p className='text-sm text-red-500 mt-1'>{errors.academicYear.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor='remarks'>Remarks</Label>
            <Textarea id='remarks' {...register('remarks')} placeholder='Any additional notes' rows={2} />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Fee' : 'Add Fee'}
        </Button>
      </div>
    </form>
  )
}