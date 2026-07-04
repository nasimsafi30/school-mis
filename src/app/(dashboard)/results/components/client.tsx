'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Trophy, TrendingUp, Users, BarChart3, Search, Medal, Star } from 'lucide-react'
import { ResultForm } from './result-form'
import { columns, ResultColumn } from './columns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ResultsClient({ data, exams, students }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExam, setSelectedExam] = useState('all')

  const formattedData: ResultColumn[] = data.map((result: any) => {
    const totalMarks = result.exam?.totalMarks || 100
    const marksObtained = Number(result.marksObtained)
    const percentage = ((marksObtained / totalMarks) * 100).toFixed(1)

    return {
      id: result.id,
      studentName: (result.student?.firstName || '') + ' ' + (result.student?.lastName || ''),
      rollNo: result.student?.rollNo || 'N/A',
      className: result.student?.class?.name || 'N/A',
      examName: result.exam?.name || 'N/A',
      subjectName: result.subject?.name || result.exam?.subject?.name || 'N/A',
      marksObtained: marksObtained,
      totalMarks: totalMarks,
      grade: result.grade || 'N/A',
      remarks: result.remarks || '',
      percentage: percentage,
      status: marksObtained >= (result.exam?.passingMarks || 40) ? 'pass' : 'fail',
    }
  })

  // Filter by search
  const filteredBySearch = formattedData.filter((r) => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return r.studentName.toLowerCase().includes(s) || r.rollNo.toLowerCase().includes(s) || r.subjectName.toLowerCase().includes(s)
  })

  // Filter by exam
  const filteredByExam = selectedExam === 'all' ? filteredBySearch : filteredBySearch.filter((r) => r.examName === selectedExam)

  // Filter by tab
  const filteredData = activeTab === 'all' ? filteredByExam : filteredByExam.filter((r: any) => r.status === activeTab)

  // Calculate stats
  const totalResults = formattedData.length
  const passCount = formattedData.filter((r) => r.status === 'pass').length
  const failCount = formattedData.filter((r) => r.status === 'fail').length
  const avgPercentage = totalResults > 0
    ? (formattedData.reduce((sum, r) => sum + Number(r.percentage), 0) / totalResults).toFixed(1)
    : '0'

  // Top performers
  const topPerformers = [...formattedData]
    .sort((a, b) => Number(b.percentage) - Number(a.percentage))
    .slice(0, 5)

  // Unique exams for filter
  const uniqueExams = [...new Set(formattedData.map((r) => r.examName))]

  const gradeColors: Record<string, string> = {
    'A+': 'bg-green-100 text-green-800',
    'A': 'bg-green-100 text-green-800',
    'B+': 'bg-blue-100 text-blue-800',
    'B': 'bg-blue-100 text-blue-800',
    'C': 'bg-yellow-100 text-yellow-800',
    'D': 'bg-orange-100 text-orange-800',
    'F': 'bg-red-100 text-red-800',
    'N/A': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Results</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            View and manage examination results
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Publish Results
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Results</CardTitle>
            <BarChart3 className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalResults}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgPercentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pass Rate</CardTitle>
            <Trophy className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(0) : 0}%
            </div>
            <p className='text-xs text-muted-foreground'>{passCount} passed, {failCount} failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Students</CardTitle>
            <Users className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {new Set(formattedData.map((r) => r.studentName)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className='bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-yellow-800'>
              <Trophy className='h-5 w-5' />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 md:grid-cols-5'>
              {topPerformers.map((student, index) => (
                <div key={index} className='text-center p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700'>
                  <div className='text-2xl mb-1'>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <Medal className='h-6 w-6 mx-auto text-gray-400 dark:text-gray-500' />}
                  </div>
                  <p className='font-medium text-sm truncate'>{student.studentName}</p>
                  <p className='text-xs text-muted-foreground'>{student.subjectName}</p>
                  <p className='text-lg font-bold text-green-600 dark:text-green-400 mt-1'>{student.percentage}%</p>
                  <Badge className={cn('mt-1 text-xs', gradeColors[student.grade] || 'bg-gray-100')}>
                    {student.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by student name or roll number...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Filter by exam' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Exams</SelectItem>
            {uniqueExams.map((exam) => (
              <SelectItem key={exam} value={exam}>{exam}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='all'>All ({filteredByExam.length})</TabsTrigger>
          <TabsTrigger value='pass'>Pass ({filteredByExam.filter((r) => r.status === 'pass').length})</TabsTrigger>
          <TabsTrigger value='fail'>Fail ({filteredByExam.filter((r) => r.status === 'fail').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable
            columns={columns()}
            data={filteredData}
            searchKey='studentName'
            searchPlaceholder='Search results...'
          />
        </TabsContent>
      </Tabs>

      {/* Publish Results Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Publish Results</DialogTitle>
          </DialogHeader>
          <ResultForm
            exams={exams}
            students={students}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}