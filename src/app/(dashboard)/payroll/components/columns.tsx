'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export type PayrollColumn = {
  id: string
  employeeName: string
  employeeId: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  paymentDate: string
}

export function columns(): ColumnDef<PayrollColumn>[] {
  return [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.getValue('employeeName')}</p>
          <p className='text-xs text-muted-foreground'>{row.original.employeeId}</p>
        </div>
      ),
    },
    {
      accessorKey: 'month',
      header: 'Period',
      cell: ({ row }) => (
        <span>{row.getValue('month')} {row.original.year}</span>
      ),
    },
    {
      accessorKey: 'basicSalary',
      header: 'Basic Salary',
      cell: ({ row }) => formatCurrency(row.getValue('basicSalary')),
    },
    {
      accessorKey: 'allowances',
      header: 'Allowances',
      cell: ({ row }) => (
        <span className='text-green-600'>+{formatCurrency(row.getValue('allowances'))}</span>
      ),
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions',
      cell: ({ row }) => (
        <span className='text-red-600'>-{formatCurrency(row.getValue('deductions'))}</span>
      ),
    },
    {
      accessorKey: 'netSalary',
      header: 'Net Salary',
      cell: ({ row }) => (
        <span className='font-bold text-lg'>{formatCurrency(row.getValue('netSalary'))}</span>
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
              status === 'paid' ? 'success' :
              status === 'processed' ? 'info' : 'warning'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'paymentDate',
      header: 'Payment Date',
    },
  ]
}
