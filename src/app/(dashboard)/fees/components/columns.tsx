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
import { MoreHorizontal, DollarSign, Trash2, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export type FeeColumn = {
  id: string
  studentName: string
  className: string
  feeType: string
  amount: number
  paidAmount: number
  balance: number
  dueDate: string
  paidDate: string
  status: string
  academicYear: string
}

export function columns({ onPayment, onDelete, onView }: any): ColumnDef<FeeColumn>[] {
  return [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('studentName')}</p>
          <p className='text-xs text-muted-foreground'>{row.original.className}</p>
        </div>
      ),
    },
    {
      accessorKey: 'feeType',
      header: 'Fee Type',
      cell: ({ row }) => (
        <Badge variant='outline'>{row.getValue('feeType')}</Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.getValue('amount')),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => (
        <span className='text-green-600 font-medium'>
          {formatCurrency(row.getValue('paidAmount'))}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = row.getValue('balance') as number
        return (
          <span className={balance > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            {formatCurrency(balance)}
          </span>
        )
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.getValue('dueDate') as string
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      },
    },
    {
      accessorKey: 'paidDate',
      header: 'Paid Date',
      cell: ({ row }) => {
        const date = row.getValue('paidDate') as string
        return date && date !== 'N/A' 
          ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : <span className='text-muted-foreground'>-</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            className={
              status === 'paid' ? 'bg-green-100 text-green-800' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              status === 'partial' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'academicYear',
      header: 'Year',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const fee = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {onView && (
                <DropdownMenuItem onClick={() => onView(fee)}>
                  <Eye className='mr-2 h-4 w-4' /> View Details
                </DropdownMenuItem>
              )}
              {fee.status !== 'paid' && onPayment && (
                <DropdownMenuItem onClick={() => onPayment(fee)}>
                  <DollarSign className='mr-2 h-4 w-4' /> Record Payment
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(fee.id)} className='text-red-600'>
                  <Trash2 className='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}