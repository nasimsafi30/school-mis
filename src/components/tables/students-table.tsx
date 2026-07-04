'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn, getInitials } from '@/lib/utils'
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface Student {
  id: string
  admissionNo: string
  rollNo?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  gender?: string
  admissionDate?: string
  admissionStatus?: string
  class?: { id: string; name: string }
  section?: { id: string; name: string }
  parent?: { id: string; fatherName?: string; motherName?: string; fatherPhone?: string }
}

interface StudentsTableProps {
  data: Student[]
  onEdit?: (student: Student) => void
  onDelete?: (id: string) => void
  onAddStudent?: () => void
  isLoading?: boolean
}

export function StudentsTable({
  data,
  onEdit,
  onDelete,
  onAddStudent,
  isLoading = false,
}: StudentsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const itemsPerPage = 10

  const uniqueClasses = [...new Set(data.map(s => s.class?.name).filter(Boolean))]

  const filteredData = data.filter((student) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      !searchTerm ||
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.admissionNo?.toLowerCase().includes(searchLower) ||
      student.rollNo?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || student.admissionStatus === statusFilter
    const matchesClass = classFilter === 'all' || student.class?.name === classFilter

    return matchesSearch && matchesStatus && matchesClass
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'firstName':
        comparison = (a.firstName || '').localeCompare(b.firstName || '')
        break
      case 'lastName':
        comparison = (a.lastName || '').localeCompare(b.lastName || '')
        break
      case 'admissionNo':
        comparison = (a.admissionNo || '').localeCompare(b.admissionNo || '')
        break
      case 'admissionDate':
        comparison = new Date(a.admissionDate || '').getTime() - new Date(b.admissionDate || '').getTime()
        break
      case 'className':
        comparison = (a.class?.name || '').localeCompare(b.class?.name || '')
        break
      default:
        comparison = 0
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedData.map(s => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id)
    } else {
      try {
        const response = await fetch('/api/students/' + id, { method: 'DELETE' })
        if (response.ok) {
          toast.success('Student deleted')
          router.refresh()
        } else {
          toast.error('Failed to delete student')
        }
      } catch (error) {
        toast.error('Failed to delete student')
      }
    }
  }

  const getStatusBadge = (status: string | undefined) => {
    const s = status || 'pending'
    switch (s) {
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Enrolled</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>
      case 'transferred':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="mr-1 h-3 w-3" />Transferred</Badge>
      case 'graduated':
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="mr-1 h-3 w-3" />Graduated</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
    return sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, admission no, email, or phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Filter by status"
            title="Filter students by admission status"
          >
            <option value="all">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
          </select>
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1) }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Filter by class"
            title="Filter students by class"
          >
            <option value="all">All Classes</option>
            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
          {onAddStudent && (
            <Button onClick={onAddStudent}>
              <UserPlus className="mr-2 h-4 w-4" />Add Student
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={paginatedData.length > 0 && paginatedData.every(s => selectedIds.includes(s.id))}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('admissionNo')}>
                <div className="flex items-center">Admission No{getSortIcon('admissionNo')}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('firstName')}>
                <div className="flex items-center">Name{getSortIcon('firstName')}</div>
              </TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('admissionDate')}>
                <div className="flex items-center">Admission Date{getSortIcon('admissionDate')}</div>
              </TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-lg font-medium text-muted-foreground">No students found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search' : 'Add your first student to get started'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((student) => (
                <TableRow key={student.id} className={cn('hover:bg-muted/30', selectedIds.includes(student.id) && 'bg-muted/50')}>
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(student.id)} onCheckedChange={(checked: boolean) => handleSelectOne(student.id, checked)} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{student.admissionNo}</span>
                    {student.rollNo && <p className="text-xs text-muted-foreground mt-1">Roll: {student.rollNo}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{student.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{student.class?.name || 'N/A'}</p>
                    {student.section?.name && <p className="text-xs text-muted-foreground">Section {student.section.name}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {student.email && <div className="flex items-center text-xs"><Mail className="mr-1 h-3 w-3" />{student.email}</div>}
                      {student.phone && <div className="flex items-center text-xs"><Phone className="mr-1 h-3 w-3" />{student.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.admissionStatus)}</TableCell>
                  <TableCell>{student.admissionDate ? format(new Date(student.admissionDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/students/' + student.id)}>
                          <Eye className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(student)}>
                            <Pencil className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(student.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-1">...</span>}
                  <Button variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className="h-8 w-8 p-0">{page}</Button>
                </div>
              ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}