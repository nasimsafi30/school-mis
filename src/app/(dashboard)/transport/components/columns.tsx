'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export type TransportColumn = {
  id: string
  routeName: string
  routeNo: string
  vehicleNo: string
  driverName: string
  driverPhone: string
  capacity: number
  students: number
  stops: string
  fee: number
}

export function columns(): ColumnDef<TransportColumn>[] {
  return [
    {
      accessorKey: 'routeNo',
      header: 'Route No',
      cell: ({ row }) => (
        <Badge variant='outline' className='font-mono'>
          {row.getValue('routeNo')}
        </Badge>
      ),
    },
    {
      accessorKey: 'routeName',
      header: 'Route Name',
      cell: ({ row }) => (
        <span className='font-medium'>{row.getValue('routeName')}</span>
      ),
    },
    {
      accessorKey: 'vehicleNo',
      header: 'Vehicle No',
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('driverName')}</p>
          <p className='text-xs text-muted-foreground'>{row.original.driverPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => {
        const students = row.original.students
        const capacity = row.getValue('capacity') as number
        const percentage = capacity > 0 ? (students / capacity) * 100 : 0
        return (
          <div>
            <span className='text-sm'>{students} / {capacity}</span>
            <div className='h-1.5 bg-gray-200 rounded-full mt-1 w-24'>
              <div
                className='h-1.5 bg-blue-500 rounded-full'
                style={{ width: percentage + '%' }}
              ></div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'fee',
      header: 'Fee/Month',
      cell: ({ row }) => formatCurrency(row.getValue('fee')),
    },
    {
      accessorKey: 'stops',
      header: 'Stops',
      cell: ({ row }) => {
        const stops = row.getValue('stops') as string
        const stopCount = stops ? stops.split('\n').filter((s: string) => s.trim()).length : 0
        return (
          <Badge variant='secondary'>
            {stopCount} stops
          </Badge>
        )
      },
    },
  ]
}