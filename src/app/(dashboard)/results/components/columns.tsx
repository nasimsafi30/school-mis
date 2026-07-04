'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy } from 'lucide-react'

export type ResultColumn = {
  id: string
  studentName: string
  rollNo: string
  className: string
  examName: string
  subjectName: string
  marksObtained: number
  totalMarks: number
  grade: string
  remarks: string
  percentage: string
  status: string
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800',
  'A': 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  'B': 'bg-blue-100 text-blue-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-orange-100 text-orange-800',
  'F': 'bg-red-100 text-red-800',
}

export function columns(): ColumnDef<ResultColumn>[] {
  return [
    {
      accessorKey: 'rollNo',
      header: 'Roll No',
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.getValue('rollNo')}</span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {Number(row.original.percentage) >= 90 && (
            <Trophy className='h-4 w-4 text-yellow-500' />
          )}
          <span className='font-medium'>{row.getValue('studentName')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'examName',
      header: 'Exam',
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
    },
    {
      accessorKey: 'marksObtained',
      header: 'Marks',
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='flex justify-between text-xs'>
            <span className='font-medium'>{row.getValue('marksObtained')}/{row.original.totalMarks}</span>
            <span>{row.original.percentage}%</span>
          </div>
          <Progress value={Number(row.original.percentage)} className='h-2' />
        </div>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }) => {
        const grade = row.getValue('grade') as string
        return (
          <Badge className={gradeColors[grade] || 'bg-gray-100 text-gray-800'}>
            {grade}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const remarks = row.getValue('remarks') as string
        return remarks || '-'
      },
    },
  ]
}
