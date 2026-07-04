'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, BookOpen, User, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TimetableClient({ timetable = [], classes = [], subjects = [], teachers = [] }: any) {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    dayOfWeek: '1', startTime: '08:00', endTime: '09:00',
    subjectId: '', teacherId: '', roomNo: '',
  })

  const selectedClassData = classes.find((c: any) => c.id === selectedClass)
  const sections = selectedClassData?.sections || []
  const availableSubjects = subjects.filter((s: any) => s.classId === selectedClass)

  const filteredTimetable = timetable.filter(
    (t: any) => t.classId === selectedClass && t.sectionId === selectedSection
  )

  const timetableByDay: Record<string, any[]> = {}
  DAYS.forEach((day, index) => {
    timetableByDay[day] = filteredTimetable
      .filter((t: any) => t.dayOfWeek === index + 1)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
  })

  const resetForm = () => {
    setFormData({ dayOfWeek: '1', startTime: '08:00', endTime: '09:00', subjectId: '', teacherId: '', roomNo: '' })
    setEditingId(null)
  }

  const handleEdit = (period: any) => {
    setEditingId(period.id)
    setFormData({
      dayOfWeek: String(period.dayOfWeek),
      startTime: period.startTime,
      endTime: period.endTime,
      subjectId: period.subjectId,
      teacherId: period.teacherId,
      roomNo: period.roomNo || '',
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!formData.subjectId) { toast.error('Please select a subject'); return }
    if (!formData.teacherId) { toast.error('Please select a teacher'); return }

    setLoading(true)
    try {
      const payload: any = {
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        roomNo: formData.roomNo || null,
      }

      let url, method
      if (editingId) {
        url = '/api/timetable/' + editingId
        method = 'PUT'
      } else {
        url = '/api/timetable'
        method = 'POST'
        payload.classId = selectedClass
        payload.sectionId = selectedSection
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingId ? 'Period updated!' : 'Period added!')
        setOpen(false)
        resetForm()
        router.refresh()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Failed')
      }
    } catch (error) {
      toast.error('Failed to save period')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this period?')) return
    try {
      await fetch('/api/timetable/' + id, { method: 'DELETE' })
      toast.success('Period deleted')
      router.refresh()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Timetable</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }} disabled={!selectedClass || !selectedSection}>
          <Plus className='mr-2 h-4 w-4' />Add Period
        </Button>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-2 gap-4 max-w-md'>
            <div>
              <label className='text-sm mb-1 block'>Class</label>
              <select className='w-full h-10 rounded-md border px-3' value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedSection('') }}
                aria-label='Select class' title='Select class'>
                <option value=''>Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className='text-sm mb-1 block'>Section</label>
              <select className='w-full h-10 rounded-md border px-3' value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}
                aria-label='Select section' title='Select section'>
                <option value=''>Select section</option>
                {sections.map((s: any) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSection && (
        <div className='space-y-4'>
          {DAYS.map((day, index) => (
            <Card key={day}>
              <CardHeader className='py-3'><CardTitle className='text-lg'>{day}</CardTitle></CardHeader>
              <CardContent>
                {(timetableByDay[day] || []).length > 0 ? (
                  <div className='space-y-2'>
                    {(timetableByDay[day] || []).map((period: any) => (
                      <div key={period.id} className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                        <div className='flex items-center gap-4 flex-wrap'>
                          <Badge variant='outline' className='font-mono'>{period.startTime} - {period.endTime}</Badge>
                          <span className='text-sm'><BookOpen className='inline h-4 w-4 mr-1 text-blue-500' />{period.subject?.name}</span>
                          <span className='text-sm text-muted-foreground'><User className='inline h-4 w-4 mr-1' />{period.teacher?.firstName} {period.teacher?.lastName}</span>
                          {period.roomNo && <span className='text-sm text-muted-foreground'><MapPin className='inline h-4 w-4 mr-1' />Room {period.roomNo}</span>}
                        </div>
                        <div className='flex gap-1'>
                          <Button variant='ghost' size='icon' onClick={() => handleEdit(period)} title='Edit'><Pencil className='h-4 w-4' /></Button>
                          <Button variant='ghost' size='icon' onClick={() => handleDelete(period.id)} title='Delete' className='text-red-500'><Trash2 className='h-4 w-4' /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground text-center py-4'>No periods</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='z-[100] max-w-md'>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Period' : 'Add New Period'}</DialogTitle></DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm mb-1 block'>Day</label>
              <select className='w-full h-10 rounded-md border px-3' value={formData.dayOfWeek}
                onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                aria-label='Select day' title='Select day'>
                {DAYS.map((d, i) => <option key={i} value={String(i+1)}>{d}</option>)}
              </select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div><label className='text-sm mb-1 block'>Start</label><Input type='time' value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} /></div>
              <div><label className='text-sm mb-1 block'>End</label><Input type='time' value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} /></div>
            </div>
            <div>
              <label className='text-sm mb-1 block'>Subject</label>
              <select className='w-full h-10 rounded-md border px-3' value={formData.subjectId}
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
                aria-label='Select subject' title='Select subject'>
                <option value=''>Select subject</option>
                {availableSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className='text-sm mb-1 block'>Teacher</label>
              <select className='w-full h-10 rounded-md border px-3' value={formData.teacherId}
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
                aria-label='Select teacher' title='Select teacher'>
                <option value=''>Select teacher</option>
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
            <div><label className='text-sm mb-1 block'>Room</label><Input value={formData.roomNo} onChange={e => setFormData({...formData, roomNo: e.target.value})} placeholder='e.g., 101' /></div>
            <div className='flex gap-2'>
              <Button onClick={handleSave} disabled={loading} className='flex-1'>{loading ? 'Saving...' : editingId ? 'Update Period' : 'Add Period'}</Button>
              <Button variant='outline' onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
