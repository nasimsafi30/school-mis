'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Search,
  Loader2,
  Calendar as CalendarIcon,
  BookOpen,
  User,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  availableCopies: number
}

interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  rollNo?: string
  class?: { id: string; name: string }
  section?: { id: string; name: string }
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  department?: { id: string; name: string }
}

interface IssueBookFormProps {
  books?: Book[]
  students?: Student[]
  teachers?: Teacher[]
  onSuccess?: () => void
  onCancel?: () => void
  preselectedBookId?: string
}

export function IssueBookForm({
  books = [],
  students = [],
  teachers = [],
  onSuccess,
  onCancel,
  preselectedBookId,
}: IssueBookFormProps) {
  const router = useRouter()

  // State
  const [borrowerType, setBorrowerType] = useState<'student' | 'teacher'>('student')
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId || '')
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('')
  const [borrowerSearch, setBorrowerSearch] = useState('')
  const [showBorrowerList, setShowBorrowerList] = useState(false)
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14))
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  // Get selected book details
  const selectedBook = books.find(b => b.id === selectedBookId)

  // Filter borrowers based on search
  const filteredBorrowers = borrowerType === 'student'
    ? students.filter((s) => {
        if (!borrowerSearch) return false
        const search = borrowerSearch.toLowerCase()
        return (
          s.firstName?.toLowerCase().includes(search) ||
          s.lastName?.toLowerCase().includes(search) ||
          s.admissionNo?.toLowerCase().includes(search) ||
          s.rollNo?.toLowerCase().includes(search)
        )
      }).slice(0, 10)
    : teachers.filter((t) => {
        if (!borrowerSearch) return false
        const search = borrowerSearch.toLowerCase()
        return (
          t.firstName?.toLowerCase().includes(search) ||
          t.lastName?.toLowerCase().includes(search) ||
          t.employeeId?.toLowerCase().includes(search)
        )
      }).slice(0, 10)

  // Get selected borrower details
  const selectedBorrower = borrowerType === 'student'
    ? students.find(s => s.id === selectedBorrowerId)
    : teachers.find(t => t.id === selectedBorrowerId)

  // Available books (with at least 1 copy)
  const availableBooks = books.filter(b => b.availableCopies > 0)

  // Handle issue submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBookId) {
      toast.error('Please select a book')
      return
    }
    if (!selectedBorrowerId) {
      toast.error(`Please select a ${borrowerType}`)
      return
    }
    if (!issueDate || !dueDate) {
      toast.error('Please select issue and due dates')
      return
    }

    try {
      setSaving(true)

      const payload = {
        bookId: selectedBookId,
        [borrowerType === 'student' ? 'studentId' : 'teacherId']: selectedBorrowerId,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
      }

      const response = await fetch('/api/issued-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const issued = await response.json()
        toast.success('Book issued successfully')
        onSuccess?.()
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to issue book')
      }
    } catch (error) {
      console.error('Error issuing book:', error)
      toast.error('Failed to issue book')
    } finally {
      setSaving(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedBookId('')
    setSelectedBorrowerId('')
    setBorrowerSearch('')
    setBorrowerType('student')
    setIssueDate(new Date())
    setDueDate(addDays(new Date(), 14))
    setStep(1)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              step === s
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : step > s
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}>
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={cn(
                'w-12 h-1 mx-1 rounded transition-all',
                step > s ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>Select Book</span>
        <span>Select Borrower</span>
        <span>Confirm & Issue</span>
      </div>

      {/* Step 1: Select Book */}
      {step === 1 && (
        <Card className="animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Book
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Book *</Label>
              <Select
                value={selectedBookId}
                onValueChange={setSelectedBookId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a book to issue" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No books available for issue
                    </div>
                  ) : (
                    availableBooks.map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground">by {book.author}</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            {book.availableCopies} available
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedBook && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedBook.title}</span>
                  <Badge>{selectedBook.availableCopies} copies available</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Author: {selectedBook.author}</p>
                <p className="text-xs text-muted-foreground">ISBN: {selectedBook.isbn}</p>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={() => selectedBookId && setStep(2)}
              disabled={!selectedBookId}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Borrower */}
      {step === 2 && (
        <Card className="animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Borrower
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Borrower Type</Label>
              <Select
                value={borrowerType}
                onValueChange={(value: 'student' | 'teacher') => {
                  setBorrowerType(value)
                  setSelectedBorrowerId('')
                  setBorrowerSearch('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Teacher
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search {borrowerType === 'student' ? 'Student' : 'Teacher'} *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    borrowerType === 'student'
                      ? 'Search by name, admission no, or roll no...'
                      : 'Search by name or employee ID...'
                  }
                  value={borrowerSearch}
                  onChange={(e) => {
                    setBorrowerSearch(e.target.value)
                    setShowBorrowerList(true)
                  }}
                  onFocus={() => setShowBorrowerList(true)}
                  className="pl-10"
                />
              </div>
              {showBorrowerList && borrowerSearch && (
                <div className="mt-1 border rounded-md max-h-48 overflow-y-auto bg-background shadow-lg">
                  {filteredBorrowers.length > 0 ? (
                    filteredBorrowers.map((borrower: any) => (
                      <div
                        key={borrower.id}
                        className={cn(
                          'p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors',
                          selectedBorrowerId === borrower.id && 'bg-accent border-l-4 border-l-primary'
                        )}
                        onClick={() => {
                          setSelectedBorrowerId(borrower.id)
                          setBorrowerSearch(
                            borrowerType === 'student'
                              ? `${borrower.firstName} ${borrower.lastName} (${borrower.admissionNo})`
                              : `${borrower.firstName} ${borrower.lastName} (${borrower.employeeId})`
                          )
                          setShowBorrowerList(false)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-full',
                            borrowerType === 'student' ? 'bg-blue-100' : 'bg-green-100'
                          )}>
                            {borrowerType === 'student' ? (
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">
                              {borrower.firstName} {borrower.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {borrowerType === 'student'
                                ? `${borrower.admissionNo}${borrower.rollNo ? ` | Roll: ${borrower.rollNo}` : ''}`
                                : borrower.employeeId
                              }
                              {borrower.class && ` | ${borrower.class.name}`}
                              {borrower.section && `-${borrower.section.name}`}
                              {borrower.department && ` | ${borrower.department.name}`}
                            </p>
                          </div>
                          {selectedBorrowerId === borrower.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No {borrowerType}s found matching "{borrowerSearch}"
                    </p>
                  )}
                </div>
              )}
              {selectedBorrowerId && selectedBorrower && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    Selected: {'firstName' in selectedBorrower 
                      ? `${selectedBorrower.firstName} ${selectedBorrower.lastName}`
                      : `${(selectedBorrower as Teacher).firstName} ${(selectedBorrower as Teacher).lastName}`
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => selectedBorrowerId && setStep(3)}
                disabled={!selectedBorrowerId}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm & Issue */}
      {step === 3 && (
        <Card className="animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Confirm & Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Issue Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Book:</span>
                  <p className="font-medium">{selectedBook?.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Author:</span>
                  <p className="font-medium">{selectedBook?.author}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Borrower:</span>
                  <p className="font-medium">
                    {selectedBorrower && 'firstName' in selectedBorrower
                      ? `${(selectedBorrower as Student).firstName} ${(selectedBorrower as Student).lastName}`
                      : selectedBorrower
                      ? `${(selectedBorrower as Teacher).firstName} ${(selectedBorrower as Teacher).lastName}`
                      : ''
                    }
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant={borrowerType === 'student' ? 'info' : 'secondary'}>
                    {borrowerType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !issueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date: Date | undefined) => date && setIssueDate(date)}
                      disabled={(date: Date) => date > new Date()}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date: Date | undefined) => date && setDueDate(date)}
                      disabled={(date: Date) => date < new Date()}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quick date buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDueDate(addDays(new Date(), 7))}
              >
                7 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDueDate(addDays(new Date(), 14))}
              >
                14 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDueDate(addDays(new Date(), 30))}
              >
                30 Days
              </Button>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Late returns will incur a fine of $1.00 per day after the due date.
                Please ensure the book is returned on or before {dueDate ? format(dueDate, 'MMMM dd, yyyy') : 'the due date'}.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Issuing...' : 'Confirm & Issue Book'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm()
              onCancel()
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  )
}