'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, ArrowUpRight, BookOpen, BookCopy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

export type BookColumn = {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string
  edition: string
  category: string
  totalCopies: number
  availableCopies: number
  shelfNo: string
  price: number
  publishedYear: number
  status: string
}

interface ColumnsProps {
  onEdit?: (book: any) => void
  onDelete?: (id: string) => void
  onView?: (book: any) => void
  onIssue?: (book: any) => void
}

export function columns({ onEdit, onDelete, onView, onIssue }: ColumnsProps = {}): ColumnDef<BookColumn>[] {
  return [
    {
      accessorKey: 'isbn',
      header: 'ISBN',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {row.getValue('isbn')}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[200px]">{row.getValue('title')}</p>
            {row.original.edition && (
              <p className="text-xs text-muted-foreground">{row.original.edition} Edition</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('author')}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string
        return category ? (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      },
    },
    {
      accessorKey: 'totalCopies',
      header: 'Total',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.getValue('totalCopies')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'availableCopies',
      header: 'Available',
      cell: ({ row }) => {
        const available = row.getValue('availableCopies') as number
        const total = row.original.totalCopies
        const percentage = total > 0 ? (available / total) * 100 : 0
        
        return (
          <div className="space-y-1 min-w-[80px]">
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  'text-xs',
                  available === 0 ? 'bg-red-100 text-red-800' :
                  available <= 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                )}
              >
                {available}
              </Badge>
              <span className="text-xs text-muted-foreground">
                /{total}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  percentage === 0 ? 'bg-red-500' :
                  percentage < 30 ? 'bg-yellow-500' :
                  'bg-green-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'shelfNo',
      header: 'Shelf',
      cell: ({ row }) => {
        const shelf = row.getValue('shelfNo') as string
        return shelf ? (
          <Badge variant="secondary" className="font-mono text-xs">
            {shelf}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const available = row.original.availableCopies
        const total = row.original.totalCopies
        
        let status: { label: string; color: string }
        if (available === 0) {
          status = { label: 'Issued Out', color: 'bg-red-100 text-red-800' }
        } else if (available <= 2) {
          status = { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
        } else {
          status = { label: 'Available', color: 'bg-green-100 text-green-800' }
        }

        return (
          <Badge className={cn('text-xs', status.color)}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number
        return price > 0 ? (
          <span className="text-sm">{formatCurrency(price)}</span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const book = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
              {onView && (
                <DropdownMenuItem onClick={() => onView(book)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(book)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Book
                </DropdownMenuItem>
              )}
              
              {onIssue && book.availableCopies > 0 && (
                <DropdownMenuItem onClick={() => onIssue(book)}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Issue Book
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(book.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Book
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}