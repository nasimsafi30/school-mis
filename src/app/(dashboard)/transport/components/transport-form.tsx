'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const transportSchema = z.object({
  routeName: z.string().min(1, 'Route name is required'),
  routeNo: z.string().min(1, 'Route number is required'),
  vehicleNo: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().min(10, 'Valid phone number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  stops: z.string().optional(),
  fee: z.number().min(0, 'Fee cannot be negative').optional(),
})

type TransportFormData = z.infer<typeof transportSchema>

interface TransportFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function TransportForm({ initialData, onSuccess }: TransportFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: initialData || {
      routeName: '',
      routeNo: '',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      capacity: 40,
      stops: '',
      fee: 0,
    },
  })

  const onSubmit = async (data: TransportFormData) => {
    try {
      const url = isEditing ? '/api/transport/' + initialData.id : '/api/transport'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Route updated' : 'Route created')
        onSuccess?.()
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to save route')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader><CardTitle>{isEditing ? 'Edit Route' : 'Add New Route'}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Route Name *</Label>
              <Input {...register('routeName')} placeholder='e.g., North Route' />
              {errors.routeName && <p className='text-sm text-red-500 mt-1'>{errors.routeName.message}</p>}
            </div>
            <div>
              <Label>Route No *</Label>
              <Input {...register('routeNo')} placeholder='e.g., R001' />
              {errors.routeNo && <p className='text-sm text-red-500 mt-1'>{errors.routeNo.message}</p>}
            </div>
            <div>
              <Label>Vehicle No *</Label>
              <Input {...register('vehicleNo')} placeholder='e.g., BUS-1234' />
              {errors.vehicleNo && <p className='text-sm text-red-500 mt-1'>{errors.vehicleNo.message}</p>}
            </div>
            <div>
              <Label>Capacity *</Label>
              <Input type='number' {...register('capacity', { valueAsNumber: true })} />
              {errors.capacity && <p className='text-sm text-red-500 mt-1'>{errors.capacity.message}</p>}
            </div>
            <div>
              <Label>Driver Name *</Label>
              <Input {...register('driverName')} placeholder="Driver's full name" />
              {errors.driverName && <p className='text-sm text-red-500 mt-1'>{errors.driverName.message}</p>}
            </div>
            <div>
              <Label>Driver Phone *</Label>
              <Input {...register('driverPhone')} placeholder='Phone number' />
              {errors.driverPhone && <p className='text-sm text-red-500 mt-1'>{errors.driverPhone.message}</p>}
            </div>
            <div>
              <Label>Monthly Fee</Label>
              <Input type='number' step='0.01' {...register('fee', { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <Label>Stops</Label>
            <Textarea {...register('stops')} placeholder='Enter stops (one per line)' rows={4} />
          </div>
        </CardContent>
      </Card>
      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>Cancel</Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Route' : 'Create Route'}
        </Button>
      </div>
    </form>
  )
}