'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, Mail, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type TeacherColumn = {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; phone: string; qualification: string; designation: string;
  department: string; joiningDate: string; status: string;
}

export function columns({ onEdit, onDelete }: any): ColumnDef<TeacherColumn>[] {
  const router = useRouter()

  return [
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      cell: ({ row }) => <span className='font-mono text-xs bg-muted px-2 py-1 rounded'>{row.getValue('employeeId')}</span>,
    },
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
            <span className='text-xs font-medium text-green-700'>{row.original.firstName[0]}{row.original.lastName[0]}</span>
          </div>
          <div>
            <p className='font-medium'>{row.original.firstName} {row.original.lastName}</p>
            <p className='text-xs text-muted-foreground'>{row.original.qualification}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Contact', cell: ({ row }) => <div className='space-y-1'><div className='flex items-center text-xs'><Mail className='mr-1 h-3 w-3' />{row.getValue('email')}</div><div className='flex items-center text-xs'><Phone className='mr-1 h-3 w-3' />{row.original.phone}</div></div> },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'department', header: 'Department' },
    { accessorKey: 'joiningDate', header: 'Join Date', cell: ({ row }) => new Date(row.getValue('joiningDate')).toLocaleDateString() },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge className={row.getValue('status') === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{row.getValue('status')}</Badge> },
    {
      id: 'actions',
      cell: ({ row }) => {
        const teacher = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant='ghost' className='h-8 w-8 p-0'><MoreHorizontal className='h-4 w-4' /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/teachers/' + teacher.id)}><Eye className='mr-2 h-4 w-4' />View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(teacher)}><Pencil className='mr-2 h-4 w-4' />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(teacher.id)} className='text-red-600'><Trash2 className='mr-2 h-4 w-4' />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
