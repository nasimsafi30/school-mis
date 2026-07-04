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
import { MoreHorizontal, Pencil, Trash2, Eye, Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export type ExamColumn = {
  id: string
  name: string
  type: string
  className: string
  subjectName: string
  date: string
  startTime: string
  endTime: string
  totalMarks: number
  passingMarks: number
  status: string
  academicYear: string
}

export function columns({ onEdit, onDelete }: any): ColumnDef<ExamColumn>[] {
  const router = useRouter()

  return [
    {
      accessorKey: 'name',
      header: 'Exam Name',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('name')}</p>
          <p className='text-xs text-muted-foreground'>{row.original.academicYear}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant='outline' className='capitalize'>
            {type.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='flex items-center text-xs'>
            <Calendar className='mr-1 h-3 w-3' />
            {formatDate(row.getValue('date'))}
          </div>
          <div className='flex items-center text-xs'>
            <Clock className='mr-1 h-3 w-3' />
            {row.original.startTime} - {row.original.endTime}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalMarks',
      header: 'Marks',
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.getValue('totalMarks')} (Pass: {row.original.passingMarks})
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant={
              status === 'completed' ? 'success' :
              status === 'ongoing' ? 'warning' : 'info'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const exam = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/exams/' + exam.id)}>
                <Eye className='mr-2 h-4 w-4' /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(exam)}>
                <Pencil className='mr-2 h-4 w-4' /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(exam.id)} className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}