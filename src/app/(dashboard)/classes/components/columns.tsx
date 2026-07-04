'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Users, BookOpen } from 'lucide-react'

export type ClassColumn = {
  id: string
  name: string
  numericName: number
  sections: number
  totalStudents: number
  capacity: number
  teachers: number
  occupancyRate: number
}

export function columns({ onEdit, onDelete }: any): ColumnDef<ClassColumn>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Class',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('name')}</p>
          <p className='text-xs text-muted-foreground'>Grade {row.original.numericName}</p>
        </div>
      ),
    },
    {
      accessorKey: 'sections',
      header: 'Sections',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
          <span>{row.getValue('sections')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalStudents',
      header: 'Students',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-muted-foreground' />
          <span>{row.getValue('totalStudents')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => (
        <span>{row.original.totalStudents} / {row.getValue('capacity')}</span>
      ),
    },
    {
      accessorKey: 'occupancyRate',
      header: 'Occupancy',
      cell: ({ row }) => {
        const rate = row.getValue('occupancyRate') as number
        return (
          <div className='w-32 space-y-1'>
            <div className='flex justify-between text-xs'>
              <span>{rate}%</span>
            </div>
            <Progress value={rate} className='h-2' />
          </div>
        )
      },
    },
    {
      accessorKey: 'teachers',
      header: 'Teachers',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const rate = row.original.occupancyRate
        return (
          <Badge
            variant={rate >= 100 ? 'destructive' : rate >= 80 ? 'warning' : 'success'}
          >
            {rate >= 100 ? 'Full' : rate >= 80 ? 'Filling' : 'Available'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const classItem = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(classItem)}>
                <Pencil className='mr-2 h-4 w-4' /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(classItem.id)} className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
