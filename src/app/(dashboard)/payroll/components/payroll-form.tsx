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
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Calculator } from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020, 'Invalid year'),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  allowances: z.number().min(0),
  deductions: z.number().min(0),
  paymentMethod: z.string().optional(),
  remarks: z.string().optional(),
})

type PayrollFormData = z.infer<typeof payrollSchema>

interface PayrollFormProps {
  initialData?: any
  teachers?: any[]
  onSuccess?: () => void
}

export function PayrollForm({ initialData, teachers = [], onSuccess }: PayrollFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: initialData || {
      employeeId: '',
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear(),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      paymentMethod: '',
      remarks: '',
    },
  })

  const basicSalary = watch('basicSalary') || 0
  const allowances = watch('allowances') || 0
  const deductions = watch('deductions') || 0
  const netSalary = basicSalary + allowances - deductions

  const onSubmit = async (data: PayrollFormData) => {
    try {
      const url = isEditing ? '/api/payroll/' + initialData.id : '/api/payroll'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, netSalary }),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Payroll updated' : 'Payroll processed')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to process payroll')
      }
    } catch (error) {
      toast.error('Failed to process payroll')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='space-y-4'>
        <div>
          <Label>Employee *</Label>
          <Select
            onValueChange={(value) => {
              setValue('employeeId', value)
              const teacher = teachers.find((t: any) => t.id === value)
              if (teacher?.salary) {
                setValue('basicSalary', Number(teacher.salary) / 12)
              }
            }}
            defaultValue={watch('employeeId')}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select employee' />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher: any) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employeeId && <p className='text-sm text-red-500 mt-1'>{errors.employeeId.message}</p>}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Month *</Label>
            <Select onValueChange={(value) => setValue('month', value)} defaultValue={watch('month')}>
              <SelectTrigger><SelectValue placeholder='Select month' /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (<SelectItem key={month} value={month}>{month}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year *</Label>
            <Input type='number' {...register('year', { valueAsNumber: true })} />
            {errors.year && <p className='text-sm text-red-500 mt-1'>{errors.year.message}</p>}
          </div>
        </div>

        <div>
          <Label>Basic Salary (Monthly) *</Label>
          <Input type='number' step='0.01' {...register('basicSalary', { valueAsNumber: true })} />
          {errors.basicSalary && <p className='text-sm text-red-500 mt-1'>{errors.basicSalary.message}</p>}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Allowances</Label>
            <Input type='number' step='0.01' {...register('allowances', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Deductions</Label>
            <Input type='number' step='0.01' {...register('deductions', { valueAsNumber: true })} />
          </div>
        </div>

        <Card className='bg-primary/5'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Basic Salary:</span>
                <span>${basicSalary.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Allowances:</span>
                <span className='text-green-600'>+${allowances.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Deductions:</span>
                <span className='text-red-600'>-${deductions.toLocaleString()}</span>
              </div>
              <div className='border-t pt-2 flex justify-between font-bold text-lg'>
                <span>Net Salary:</span>
                <span>${netSalary.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Label>Payment Method</Label>
          <Select onValueChange={(value) => setValue('paymentMethod', value)} defaultValue={watch('paymentMethod')}>
            <SelectTrigger><SelectValue placeholder='Select payment method' /></SelectTrigger>
            <SelectContent>
              <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
              <SelectItem value='check'>Check</SelectItem>
              <SelectItem value='cash'>Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Remarks</Label>
          <Textarea {...register('remarks')} placeholder='Any additional notes' rows={2} />
        </div>
      </div>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Processing...' : isEditing ? 'Update Payroll' : 'Process Payroll'}
        </Button>
      </div>
    </form>
  )
}