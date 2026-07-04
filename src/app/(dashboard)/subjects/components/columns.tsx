'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, BookOpen } from 'lucide-react'

export type SubjectColumn = {
  id: string
  name: string
  code: string
  class: string
  teacher: string
  isOptional: boolean
  credits: number
}

export function columns({ onEdit, onDelete }: any): ColumnDef<SubjectColumn>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant='outline' className='font-mono'>
          {row.getValue('code')}
        </Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Subject Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
          <span className='font-medium'>{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'class',
      header: 'Class',
    },
    {
      accessorKey: 'teacher',
      header: 'Teacher',
      cell: ({ row }) => {
        const teacher = row.getValue('teacher') as string
        return teacher === 'Not Assigned' ? (
          <span className='text-muted-foreground italic'>{teacher}</span>
        ) : (
          <span>{teacher}</span>
        )
      },
    },
    {
      accessorKey: 'isOptional',
      header: 'Type',
      cell: ({ row }) => {
        const isOptional = row.getValue('isOptional') as boolean
        return (
          <Badge variant={isOptional ? 'secondary' : 'default'}>
            {isOptional ? 'Optional' : 'Mandatory'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'credits',
      header: 'Credits',
      cell: ({ row }) => {
        const credits = row.getValue('credits') as number
        return credits > 0 ? credits : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const subject = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(subject)}>
                <Pencil className='mr-2 h-4 w-4' /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(subject.id)} className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
