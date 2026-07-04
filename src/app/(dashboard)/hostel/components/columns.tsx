'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'

export type HostelColumn = {
  id: string
  name: string
  type: string
  wardenName: string
  wardenPhone: string
  capacity: number
  occupied: number
  available: number
  occupancyRate: string
  fee: number
  students: number
}

export function columns(): ColumnDef<HostelColumn>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Hostel Name',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('name')}</p>
          <Badge variant={row.original.type === 'boys' ? 'info' : 'secondary'} className='mt-1'>
            {row.original.type}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'wardenName',
      header: 'Warden',
      cell: ({ row }) => (
        <div>
          <p>{row.getValue('wardenName')}</p>
          <p className='text-xs text-muted-foreground'>{row.original.wardenPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Occupancy',
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='flex justify-between text-xs'>
            <span>{row.original.occupied} / {row.getValue('capacity')}</span>
            <span>{row.original.occupancyRate}%</span>
          </div>
          <Progress value={Number(row.original.occupancyRate)} className='h-2' />
        </div>
      ),
    },
    {
      accessorKey: 'available',
      header: 'Available',
      cell: ({ row }) => {
        const available = row.getValue('available') as number
        return (
          <Badge variant={available > 0 ? 'success' : 'destructive'}>
            {available} beds
          </Badge>
        )
      },
    },
    {
      accessorKey: 'fee',
      header: 'Fee/Month',
      cell: ({ row }) => formatCurrency(row.getValue('fee')),
    },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => row.getValue('students'),
    },
  ]
}
