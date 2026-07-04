'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronDown, Download, Mail, Printer, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BulkOperationsProps {
  selectedIds: string[]
  onDelete: (ids: string[]) => Promise<void>
  onExport?: (ids: string[]) => Promise<void>
  onEmail?: (ids: string[]) => Promise<void>
  onPrint?: (ids: string[]) => void
  onStatusChange?: (ids: string[], status: string) => Promise<void>
}

export function BulkOperations({
  selectedIds,
  onDelete,
  onExport,
  onEmail,
  onPrint,
  onStatusChange,
}: BulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      await onDelete(selectedIds)
      toast.success(`${selectedIds.length} items deleted successfully`)
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete items')
    } finally {
      setLoading(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          {selectedIds.length} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              Bulk Actions
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {onStatusChange && (
              <>
                <DropdownMenuItem onClick={() => onStatusChange(selectedIds, 'active')}>
                  <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                  Mark Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(selectedIds, 'inactive')}>
                  <XCircle className='mr-2 h-4 w-4 text-yellow-500' />
                  Mark Inactive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {onExport && (
              <DropdownMenuItem onClick={() => onExport(selectedIds)}>
                <Download className='mr-2 h-4 w-4' />
                Export Selected
              </DropdownMenuItem>
            )}

            {onEmail && (
              <DropdownMenuItem onClick={() => onEmail(selectedIds)}>
                <Mail className='mr-2 h-4 w-4' />
                Send Email
              </DropdownMenuItem>
            )}

            {onPrint && (
              <DropdownMenuItem onClick={() => onPrint(selectedIds)}>
                <Printer className='mr-2 h-4 w-4' />
                Print Selected
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className='text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => window.location.reload()}
        >
          Clear Selection
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{selectedIds.length} selected items</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Deleting...</>
              ) : (
                `Delete ${selectedIds.length} items`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}