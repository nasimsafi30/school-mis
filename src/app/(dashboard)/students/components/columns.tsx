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
import { MoreHorizontal, Pencil, Trash2, Eye, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export type StudentColumn = {
  id: string
  admissionNo: string
  rollNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  className: string
  sectionName: string
  admissionDate: string
  status: string
  parentName: string
}

export function columns({ onEdit, onDelete }: any): ColumnDef<StudentColumn>[] {
  const router = useRouter()

  return [
    {
      accessorKey: 'admissionNo',
      header: 'Admission No',
      cell: ({ row }) => (
        <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
          {row.getValue('admissionNo')}
        </span>
      ),
    },
    {
      accessorKey: 'rollNo',
      header: 'Roll No',
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
            <span className='text-xs font-medium text-primary'>
              {row.original.firstName[0]}{row.original.lastName[0]}
            </span>
          </div>
          <span className='font-medium'>{row.getValue('firstName')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => (
        <div className='space-y-1'>
          <p className='font-medium'>{row.getValue('className')}</p>
          <p className='text-xs text-muted-foreground'>Section {row.original.sectionName}</p>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='flex items-center text-xs'>
            <Mail className='mr-1 h-3 w-3' />
            {row.getValue('email') || 'N/A'}
          </div>
          <div className='flex items-center text-xs'>
            <Phone className='mr-1 h-3 w-3' />
            {row.original.phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'admissionDate',
      header: 'Admission Date',
      cell: ({ row }) => {
        const date = row.getValue('admissionDate') as string
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            className={cn(
              status === 'enrolled' && 'bg-green-100 text-green-800',
              status === 'pending' && 'bg-yellow-100 text-yellow-800',
              status === 'transferred' && 'bg-blue-100 text-blue-800',
              status === 'graduated' && 'bg-purple-100 text-purple-800'
            )}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const student = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/students/' + student.id)}>
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(student)}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(student.id)} className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}