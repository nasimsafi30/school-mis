'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, Save, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultFormProps {
  exams?: any[]
  students?: any[]
  onSuccess?: () => void
}

export function ResultForm({ exams = [], students = [], onSuccess }: ResultFormProps) {
  const router = useRouter()
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [resultsData, setResultsData] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load students when exam is selected
  useEffect(() => {
    if (selectedExam) {
      const examStudents = students.filter((s: any) => s.classId === selectedExam.classId)
      setResultsData(
        examStudents.map((student: any) => ({
          studentId: student.id,
          studentName: (student.firstName || '') + ' ' + (student.lastName || ''),
          rollNo: student.rollNo || 'N/A',
          marksObtained: 0,
          remarks: '',
        }))
      )
    }
  }, [selectedExam, students])

  // Handle marks change
  const handleMarksChange = (studentId: string, marks: number) => {
    setResultsData((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, marksObtained: marks } : r))
    )
  }

  // Handle remarks change
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setResultsData((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    )
  }

  // Calculate grade
  const calculateGrade = (marks: number) => {
    if (!selectedExam) return '-'
    const percentage = (marks / selectedExam.totalMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    if (percentage >= 40) return 'D'
    return 'F'
  }

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800'
      case 'A': return 'bg-green-100 text-green-800'
      case 'B+': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter results by search
  const filteredResults = resultsData.filter((r) => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return r.studentName.toLowerCase().includes(s) || r.rollNo.toLowerCase().includes(s)
  })

  // Calculate stats
  const totalStudents = resultsData.length
  const marksEntered = resultsData.filter((r) => r.marksObtained > 0).length
  const passCount = selectedExam
    ? resultsData.filter((r) => r.marksObtained >= selectedExam.passingMarks).length
    : 0
  const failCount = selectedExam ? totalStudents - passCount : 0

  // Submit results
  const onSubmit = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam')
      return
    }

    if (marksEntered === 0) {
      toast.error('Please enter marks for at least one student')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        examId: selectedExam.id,
        results: resultsData
          .filter((r) => r.marksObtained > 0)
          .map((r) => ({
            studentId: r.studentId,
            subjectId: selectedExam.subjectId,
            marksObtained: r.marksObtained,
            remarks: r.remarks || null,
          })),
      }

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(`Results published for ${payload.results.length} students`)
        onSuccess?.()
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to publish results')
      }
    } catch (error) {
      toast.error('Failed to publish results')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Select Exam */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label>Exam *</Label>
              <Select
                onValueChange={(value) => {
                  const exam = exams.find((e: any) => e.id === value)
                  setSelectedExam(exam)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select an exam' />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} - {exam.subject?.name} ({exam.class?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExam && (
              <div className='p-4 bg-muted rounded-lg grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Subject</p>
                  <p className='font-medium'>{selectedExam.subject?.name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Class</p>
                  <p className='font-medium'>{selectedExam.class?.name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Marks</p>
                  <p className='font-medium'>{selectedExam.totalMarks}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Passing Marks</p>
                  <p className='font-medium'>{selectedExam.passingMarks}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Entry */}
      {resultsData.length > 0 && (
        <>
          {/* Stats */}
          <div className='grid gap-4 grid-cols-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>{totalStudents}</div>
                <p className='text-xs text-muted-foreground'>Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-blue-600'>{marksEntered}</div>
                <p className='text-xs text-muted-foreground'>Marks Entered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-green-600'>{passCount}</div>
                <p className='text-xs text-muted-foreground'>Pass</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-red-600'>{failCount}</div>
                <p className='text-xs text-muted-foreground'>Fail</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div>
            <Input
              placeholder='Search students...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Enter Marks</CardTitle>
              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                {isSubmitting ? 'Publishing...' : 'Publish Results'}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => {
                      const percentage = selectedExam
                        ? ((result.marksObtained / selectedExam.totalMarks) * 100).toFixed(1)
                        : '0'
                      const grade = calculateGrade(result.marksObtained)
                      const isPass = selectedExam
                        ? result.marksObtained >= selectedExam.passingMarks
                        : false

                      return (
                        <TableRow key={result.studentId}>
                          <TableCell className='font-mono text-sm'>{result.rollNo}</TableCell>
                          <TableCell className='font-medium'>{result.studentName}</TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              value={result.marksObtained || ''}
                              onChange={(e) =>
                                handleMarksChange(result.studentId, Number(e.target.value))
                              }
                              className='w-24'
                              min={0}
                              max={selectedExam?.totalMarks || 100}
                              placeholder='0'
                            />
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Progress value={Number(percentage)} className='h-1.5 w-16' />
                              <span className='text-sm'>{percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', getGradeColor(grade))}>
                              {grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.marksObtained > 0 ? (
                              isPass ? (
                                <Badge className='bg-green-100 text-green-800'>
                                  <CheckCircle className='mr-1 h-3 w-3' /> Pass
                                </Badge>
                              ) : (
                                <Badge className='bg-red-100 text-red-800'>
                                  <XCircle className='mr-1 h-3 w-3' /> Fail
                                </Badge>
                              )
                            ) : (
                              <span className='text-xs text-muted-foreground'>-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={result.remarks || ''}
                              onChange={(e) =>
                                handleRemarksChange(result.studentId, e.target.value)
                              }
                              className='w-32'
                              placeholder='Optional'
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}