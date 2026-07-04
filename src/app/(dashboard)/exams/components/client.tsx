'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react'
import { columns, ExamColumn } from './columns'
import { toast } from 'sonner'

export function ExamsClient({ data, classes, subjects }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', type: 'mid_term', classId: '', subjectId: '', date: '',
    startTime: '09:00', endTime: '11:00', totalMarks: 100, passingMarks: 40,
    academicYear: '2024-2025', description: '',
  })

  const exams = Array.isArray(data) ? data : []
  const upcomingCount = exams.filter((e: any) => e.status === 'upcoming').length
  const todayCount = exams.filter((e: any) => new Date(e.date).toDateString() === new Date().toDateString()).length
  const completedCount = exams.filter((e: any) => e.status === 'completed').length

  const resetForm = () => {
    setFormData({ name: '', type: 'mid_term', classId: '', subjectId: '', date: '', startTime: '09:00', endTime: '11:00', totalMarks: 100, passingMarks: 40, academicYear: '2024-2025', description: '' })
    setEditingExam(null)
  }

  const handleEdit = (exam: any) => {
    setEditingExam(exam)
    setFormData({
      name: exam.name, type: exam.type, classId: exam.classId, subjectId: exam.subjectId,
      date: exam.date?.split('T')[0] || '', startTime: exam.startTime || '09:00', endTime: exam.endTime || '11:00',
      totalMarks: exam.totalMarks, passingMarks: exam.passingMarks, academicYear: exam.academicYear, description: exam.description || '',
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = editingExam ? '/api/exams/' + editingExam.id : '/api/exams'
      const method = editingExam ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingExam ? 'Updated!' : 'Created!'); resetForm(); setOpen(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await fetch('/api/exams/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  const formatted: ExamColumn[] = exams.map((e: any) => ({
    id: e.id, name: e.name, type: e.type, className: e.class?.name || 'N/A', subjectName: e.subject?.name || 'N/A',
    date: e.date, startTime: e.startTime, endTime: e.endTime, totalMarks: e.totalMarks, passingMarks: e.passingMarks,
    status: e.status, academicYear: e.academicYear,
  }))

  return (
    <div className='space-y-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Examinations</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}><Plus className='mr-2 h-4 w-4' />Create Exam</Button>
      </div>

      <div className='grid grid-cols-4 gap-4'>
        <Card className='bg-white dark:bg-gray-800 border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Exams</CardTitle>
            <BookOpen className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold'>{exams.length}</div></CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-800 border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Upcoming</CardTitle>
            <Calendar className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold text-green-600'>{upcomingCount}</div></CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-800 border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Today</CardTitle>
            <Clock className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold text-yellow-600'>{todayCount}</div></CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-800 border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold text-purple-600'>{completedCount}</div></CardContent>
        </Card>
      </div>

      {open && (
        <Card className='bg-white dark:bg-gray-800 border'>
          <CardHeader><CardTitle>{editingExam ? 'Edit' : 'Create'} Exam</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div>
                  <Label>Type</Label>
                  <select className='w-full h-10 rounded-md border px-3 bg-background' value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value='mid_term'>Mid Term</option><option value='final'>Final</option><option value='quiz'>Quiz</option>
                  </select>
                </div>
                <div><Label>Academic Year</Label><Input value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} /></div>
                <div>
                  <Label>Class</Label>
                  <select className='w-full h-10 rounded-md border px-3 bg-background' value={formData.classId} onChange={e => { setFormData({...formData, classId: e.target.value, subjectId: ''}) }}>
                    <option value=''>Select class</option>
                    {(classes || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <select className='w-full h-10 rounded-md border px-3 bg-background' value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                    <option value=''>Select subject</option>
                    {(subjects || []).filter((s: any) => s.classId === formData.classId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><Label>Date *</Label><Input type='date' value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                <div><Label>Start Time</Label><Input type='time' value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} /></div>
                <div><Label>End Time</Label><Input type='time' value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} /></div>
                <div><Label>Total Marks *</Label><Input type='number' value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: Number(e.target.value)})} required /></div>
                <div><Label>Passing Marks *</Label><Input type='number' value={formData.passingMarks} onChange={e => setFormData({...formData, passingMarks: Number(e.target.value)})} required /></div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => { resetForm(); setOpen(false) }}>Cancel</Button>
                <Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingExam ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} data={formatted} searchKey='name' />
    </div>
  )
}
