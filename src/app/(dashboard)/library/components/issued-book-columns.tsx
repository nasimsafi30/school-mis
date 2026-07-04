'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, isAfter, differenceInDays } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'
import {
  BookOpen,
  User,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export type IssuedBookColumn = {
  id: string
  bookTitle: string
  bookIsbn: string
  bookAuthor: string
  borrowerName: string
  borrowerId: string
  borrowerType: 'Student' | 'Teacher'
  borrowerClass: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  status: string
  fine: number
  daysOverdue: number
}

interface IssuedBookColumnsProps {
  onReturn?: (id: string) => void
  onView?: (id: string) => void
}

export function issuedBookColumns({ onReturn, onView }: IssuedBookColumnsProps = {}): ColumnDef<IssuedBookColumn>[] {
  const router = useRouter()

  return [
    {
      accessorKey: 'bookTitle',
      header: 'Book Details',
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[200px]">{row.getValue('bookTitle')}</p>
            <p className="text-xs text-muted-foreground">{row.original.bookAuthor}</p>
            <p className="text-xs text-muted-foreground font-mono">{row.original.bookIsbn}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'borrowerName',
      header: 'Borrower',
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          {row.original.borrowerType === 'Student' ? (
            <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          ) : (
            <User className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[150px]">{row.getValue('borrowerName')}</p>
            <p className="text-xs text-muted-foreground">{row.original.borrowerId}</p>
            {row.original.borrowerClass && (
              <p className="text-xs text-muted-foreground">{row.original.borrowerClass}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'borrowerType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('borrowerType') as string
        return (
          <Badge
            variant={type === 'Student' ? 'info' : 'secondary'}
            className="text-xs"
          >
            {type === 'Student' ? (
              <GraduationCap className="mr-1 h-3 w-3" />
            ) : (
              <User className="mr-1 h-3 w-3" />
            )}
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => {
        const date = row.getValue('issueDate') as string
        return (
          <div className="text-sm">
            <p>{format(new Date(date), 'MMM dd, yyyy')}</p>
            <p className="text-xs text-muted-foreground">
              {differenceInDays(new Date(), new Date(date))} days ago
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue('dueDate') as string)
        const isOverdue = isAfter(new Date(), dueDate)
        const daysUntilDue = differenceInDays(dueDate, new Date())
        const daysOverdue = differenceInDays(new Date(), dueDate)

        return (
          <div className="text-sm">
            <p className={cn(isOverdue && 'text-red-600 font-medium')}>
              {format(dueDate, 'MMM dd, yyyy')}
            </p>
            {isOverdue ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {daysOverdue} days overdue
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {daysUntilDue === 0
                  ? 'Due today'
                  : daysUntilDue === 1
                  ? 'Due tomorrow'
                  : `${daysUntilDue} days remaining`}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => {
        const date = row.getValue('returnDate') as string | null
        return date ? (
          <span className="text-sm text-green-600">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not returned</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const isOverdue = row.original.daysOverdue > 0 && status === 'issued'

        const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
          issued: {
            label: isOverdue ? 'Overdue' : 'Issued',
            color: isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800',
            icon: isOverdue ? <AlertCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />,
          },
          returned: {
            label: 'Returned',
            color: 'bg-green-100 text-green-800',
            icon: <CheckCircle className="mr-1 h-3 w-3" />,
          },
          lost: {
            label: 'Lost',
            color: 'bg-red-100 text-red-800',
            icon: <AlertCircle className="mr-1 h-3 w-3" />,
          },
        }

        const config = statusConfig[status] || statusConfig.issued

        return (
          <Badge className={cn('text-xs', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'fine',
      header: 'Fine',
      cell: ({ row }) => {
        const fine = row.getValue('fine') as number
        const daysOverdue = row.original.daysOverdue
        const calculatedFine = daysOverdue > 0 ? daysOverdue * 1 : 0

        return (
          <div className="text-sm">
            {fine > 0 || calculatedFine > 0 ? (
              <span className="text-red-600 font-medium">
                {formatCurrency(fine || calculatedFine)}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
            {daysOverdue > 0 && fine === 0 && (
              <p className="text-xs text-red-500">Will be applied on return</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Overdue',
      cell: ({ row }) => {
        const days = row.getValue('daysOverdue') as number
        return days > 0 ? (
          <Badge className="bg-red-100 text-red-800 text-xs">
            {days} {days === 1 ? 'day' : 'days'}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const issuedBook = row.original
        const isReturned = issuedBook.status === 'returned'

        if (isReturned) {
          return (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-muted-foreground"
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Returned
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(issuedBook.id)}
              >
                View
              </Button>
            )}
            {onReturn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReturn(issuedBook.id)}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Return
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}