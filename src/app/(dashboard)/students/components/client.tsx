'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { StudentsTable } from '@/components/tables/students-table'

export function StudentsClient({ data, classes, sections }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male',
    email: '', phone: '', address: '', classId: '', sectionId: '',
    admissionDate: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', dateOfBirth: '', gender: 'male',
      email: '', phone: '', address: '', classId: '', sectionId: '',
      admissionDate: new Date().toISOString().split('T')[0],
    })
    setEditingStudent(null)
  }

  const handleEdit = (student: any) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName || '', lastName: student.lastName || '',
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '', gender: student.gender || 'male',
      email: student.email || '', phone: student.phone || '', address: student.address || '',
      classId: student.classId || '', sectionId: student.sectionId || '',
      admissionDate: student.admissionDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingStudent ? '/api/students/' + editingStudent.id : '/api/students'
      const method = editingStudent ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) {
        toast.success(editingStudent ? 'Student updated!' : 'Student created!')
        resetForm(); setOpen(false); router.refresh()
      } else { const err = await res.json(); toast.error(err.error || 'Failed') }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return
    try { await fetch('/api/students/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Students</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}><Plus className='mr-2 h-4 w-4' />Add Student</Button>
      </div>

      <StudentsTable data={data} onEdit={handleEdit} onDelete={handleDelete} onAddStudent={() => { resetForm(); setOpen(true) }} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader><DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div><Label>First Name *</Label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required /></div>
              <div><Label>Last Name *</Label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required /></div>
              <div><Label>Date of Birth *</Label><Input type='date' value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} required /></div>
              <div>
                <Label>Gender *</Label>
                <select aria-label='Gender' className='w-full h-10 rounded-md border px-3' value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value='male'>Male</option><option value='female'>Female</option><option value='other'>Other</option>
                </select>
              </div>
              <div><Label>Email</Label><Input type='email' value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div>
                <Label>Class *</Label>
                <select aria-label='Class' className='w-full h-10 rounded-md border px-3' value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                  <option value=''>Select class</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Section</Label>
                <select aria-label='Section' className='w-full h-10 rounded-md border px-3' value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})}>
                  <option value=''>Select section</option>
                  {sections?.filter((s: any) => s.classId === formData.classId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><Label>Admission Date *</Label><Input type='date' value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} required /></div>
              <div><Label>Address</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            </div>
            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={() => { resetForm(); setOpen(false) }}>Cancel</Button>
              <Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingStudent ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
