'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon, CheckCircle, XCircle, Clock, Save, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

export function AttendanceClient({ classes }: any) {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedClassData = classes?.find((c: any) => c.id === selectedClass)
  const sections = selectedClassData?.sections || []

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) return
    setLoading(true)
    try {
      const date = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${date}`)
      const data = await res.json()
      setStudents(data.students || [])
      const map: Record<string, string> = {}
      data.attendance?.forEach((a: any) => { map[a.studentId] = a.status })
      setAttendance(map)
    } catch (e) { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [selectedClass, selectedSection, selectedDate])

  const handleStatus = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const markAllPresent = () => {
    const map: Record<string, string> = {}
    students.forEach(s => { map[s.id] = 'present' })
    setAttendance(map)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const date = format(selectedDate, 'yyyy-MM-dd')
      const records = students.map(s => ({ studentId: s.id, classId: selectedClass, date, status: attendance[s.id] || 'present' }))
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceRecords: records, classId: selectedClass, date }),
      })
      if (res.ok) { toast.success('Saved!'); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const changeDate = (days: number) => {
    const d = new Date(selectedDate); d.setDate(d.getDate() + days); setSelectedDate(d)
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Attendance</h1>

      <div className='grid grid-cols-4 gap-4'>
        <div>
          <Label>Class</Label>
          <select className='w-full h-10 rounded-md border px-3' value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection('') }}>
            <option value=''>Select class</option>
            {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Section</Label>
          <select className='w-full h-10 rounded-md border px-3' value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
            <option value=''>Select section</option>
            {sections?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='icon' onClick={() => changeDate(-1)}><ChevronLeft className='h-4 w-4' /></Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' className='w-full'><CalendarIcon className='mr-2 h-4 w-4' />{format(selectedDate, 'MMM dd, yyyy')}</Button>
              </PopoverTrigger>
              <PopoverContent><Calendar mode='single' selected={selectedDate} onSelect={(d: Date | undefined) => d && setSelectedDate(d)} disabled={(d: Date) => d > new Date()} /></PopoverContent>
            </Popover>
            <Button variant='outline' size='icon' onClick={() => changeDate(1)} disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>
      </div>

      {loading && <div className='text-center py-8'><Loader2 className='h-8 w-8 animate-spin mx-auto' /></div>}

      {!loading && selectedClass && students.length > 0 && (
        <>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={markAllPresent}><CheckCircle className='mr-2 h-4 w-4 text-green-500' />Mark All Present</Button>
            <Button size='sm' onClick={handleSave} disabled={saving}><Save className='mr-2 h-4 w-4' />{saving ? 'Saving...' : 'Save Attendance'}</Button>
          </div>

          <Card>
            <CardContent className='p-0'>
              <table className='w-full'>
                <thead><tr className='bg-muted/50'><th className='p-3 text-left'>Roll No</th><th className='p-3 text-left'>Name</th><th className='p-3 text-center'>Status</th></tr></thead>
                <tbody>
                  {students.map((s: any) => (
                    <tr key={s.id} className='border-b hover:bg-muted/30'>
                      <td className='p-3'>{s.rollNo || 'N/A'}</td>
                      <td className='p-3 font-medium'>{s.firstName} {s.lastName}</td>
                      <td className='p-3'>
                        <div className='flex justify-center gap-2'>
                          {['present', 'absent', 'late'].map(status => (
                            <Button
                              key={status}
                              size='sm'
                              variant={attendance[s.id] === status ? 'default' : 'outline'}
                              className={cn(
                                status === 'present' && 'text-green-600',
                                status === 'absent' && 'text-red-600',
                                status === 'late' && 'text-yellow-600'
                              )}
                              onClick={() => handleStatus(s.id, status)}
                            >
                              {status === 'present' ? <CheckCircle className='mr-1 h-3 w-3' /> : status === 'absent' ? <XCircle className='mr-1 h-3 w-3' /> : <Clock className='mr-1 h-3 w-3' />}
                              {status}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && selectedClass && students.length === 0 && (
        <Card><CardContent className='text-center py-8 text-muted-foreground'>No students found</CardContent></Card>
      )}
    </div>
  )
}
