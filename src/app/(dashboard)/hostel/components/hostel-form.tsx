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

const hostelSchema = z.object({
  name: z.string().min(1, 'Hostel name is required'),
  type: z.enum(['boys', 'girls']),
  wardenName: z.string().optional(),
  wardenPhone: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  fee: z.number().min(0, 'Fee cannot be negative'),
  address: z.string().optional(),
  facilities: z.string().optional(),
})

type HostelFormData = z.infer<typeof hostelSchema>

interface HostelFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function HostelForm({ initialData, onSuccess }: HostelFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HostelFormData>({
    resolver: zodResolver(hostelSchema),
    defaultValues: initialData || {
      name: '',
      type: 'boys',
      wardenName: '',
      wardenPhone: '',
      capacity: 50,
      fee: 0,
      address: '',
      facilities: '',
    },
  })

  const onSubmit = async (data: HostelFormData) => {
    try {
      const url = isEditing ? '/api/hostels/' + initialData.id : '/api/hostels'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Hostel updated' : 'Hostel created')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to save hostel')
      }
    } catch (error) {
      toast.error('Failed to save hostel')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Hostel' : 'Add New Hostel'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Hostel Name *</Label>
              <Input {...register('name')} placeholder='Enter hostel name' />
              {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
            </div>
            <div>
              <Label>Type *</Label>
              <Select onValueChange={(value: 'boys' | 'girls') => setValue('type', value)} defaultValue={watch('type')}>
                <SelectTrigger><SelectValue placeholder='Select type' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='boys'>Boys Hostel</SelectItem>
                  <SelectItem value='girls'>Girls Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Warden Name</Label>
              <Input {...register('wardenName')} placeholder="Warden's name" />
            </div>
            <div>
              <Label>Warden Phone</Label>
              <Input {...register('wardenPhone')} placeholder='Phone number' />
            </div>
            <div>
              <Label>Capacity *</Label>
              <Input type='number' {...register('capacity', { valueAsNumber: true })} />
              {errors.capacity && <p className='text-sm text-red-500 mt-1'>{errors.capacity.message}</p>}
            </div>
            <div>
              <Label>Monthly Fee</Label>
              <Input type='number' step='0.01' {...register('fee', { valueAsNumber: true })} />
              {errors.fee && <p className='text-sm text-red-500 mt-1'>{errors.fee.message}</p>}
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea {...register('address')} placeholder='Hostel address' rows={3} />
          </div>
          <div>
            <Label>Facilities</Label>
            <Textarea {...register('facilities')} placeholder='Available facilities (one per line)' rows={4} />
          </div>
        </CardContent>
      </Card>
      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Hostel' : 'Create Hostel'}
        </Button>
      </div>
    </form>
  )
}