'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

export function TeachersClient({ data, departments }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: 'male', joiningDate: '', qualification: '', designation: '', salary: '', address: '', departmentId: '' })

  const teachers = Array.isArray(data) ? data : []

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: 'male', joiningDate: '', qualification: '', designation: '', salary: '', address: '', departmentId: '' })
    setEditingId(null)
  }

  const handleEdit = (teacher: any) => {
    setEditingId(teacher.id)
    setFormData({
      firstName: teacher.firstName || '', lastName: teacher.lastName || '', email: teacher.email || '', phone: teacher.phone || '',
      dateOfBirth: teacher.dateOfBirth?.split('T')[0] || '', gender: teacher.gender || 'male',
      joiningDate: teacher.joiningDate?.split('T')[0] || '', qualification: teacher.qualification || '',
      designation: teacher.designation || '', salary: teacher.salary || '', address: teacher.address || '', departmentId: teacher.departmentId || '',
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) { toast.error('Please fill required fields'); return }
    setLoading(true)
    try {
      const url = editingId ? '/api/teachers/' + editingId : '/api/teachers'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingId ? 'Updated!' : 'Created!'); resetForm(); setOpen(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    try { await fetch('/api/teachers/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  return (
    <div className='space-y-6'>
      {/* Action Bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-1 bg-violet-500 rounded-full' />
          <p className='text-sm text-muted-foreground'>{teachers.length} teachers found</p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true) }} className='btn-modern bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20'>
          <Plus className='mr-2 h-4 w-4' />Add Teacher
        </Button>
      </div>

      {/* Teachers Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {teachers.map((teacher: any) => (
          <Card key={teacher.id} className='group card-hover border-0 shadow-md overflow-hidden'>
            {/* Card Header with gradient */}
            <div className='h-2 bg-gradient-to-r from-violet-500 to-purple-600' />
            <CardContent className='p-6'>
              {/* Avatar & Name */}
              <div className='flex items-start gap-4 mb-4'>
                <div className='h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20 flex-shrink-0'>
                  {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-lg truncate'>{teacher.firstName} {teacher.lastName}</h3>
                  <p className='text-sm text-muted-foreground'>{teacher.designation || 'Teacher'}</p>
                  <Badge className='mt-1 badge-purple text-xs'>{teacher.department?.name || 'Unassigned'}</Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Mail className='h-3.5 w-3.5' />
                  <span className='truncate'>{teacher.email}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Phone className='h-3.5 w-3.5' />
                  <span>{teacher.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <GraduationCap className='h-3.5 w-3.5' />
                  <span>{teacher.qualification || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Calendar className='h-3.5 w-3.5' />
                  <span>Joined {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className='flex items-center justify-between mt-4 pt-4 border-t'>
                <Badge className={teacher.status === 'active' ? 'badge-success' : 'badge-warning'}>
                  {teacher.status || 'active'}
                </Badge>
                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => handleEdit(teacher)}>
                    <Pencil className='h-4 w-4 text-violet-600' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => handleDelete(teacher.id)}>
                    <Trash2 className='h-4 w-4 text-rose-500' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {teachers.length === 0 && (
        <Card className='border-0 shadow-md'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='text-6xl mb-4'>👨‍🏫</div>
            <p className='text-lg font-medium text-muted-foreground'>No teachers found</p>
            <p className='text-sm text-muted-foreground mt-1'>Add your first teacher to get started</p>
            <Button onClick={() => { resetForm(); setOpen(true) }} className='mt-4 bg-gradient-to-r from-violet-600 to-purple-600'>
              <Plus className='mr-2 h-4 w-4' />Add Teacher
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div><label className='text-sm font-medium mb-1 block'>First Name *</label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required /></div>
              <div><label className='text-sm font-medium mb-1 block'>Last Name *</label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required /></div>
              <div><label className='text-sm font-medium mb-1 block'>Email *</label><Input type='email' value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
              <div><label className='text-sm font-medium mb-1 block'>Phone *</label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
              <div><label className='text-sm font-medium mb-1 block'>Date of Birth</label><Input type='date' value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} /></div>
              <div>
                <label htmlFor="gender-select" className='text-sm font-medium mb-1 block'>Gender</label>
                <select 
                  id="gender-select"
                  name="gender"
                  title="Select gender"
                  aria-label="Select gender"
                  className='w-full h-10 rounded-md border px-3 bg-background' 
                  value={formData.gender} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div><label className='text-sm font-medium mb-1 block'>Joining Date</label><Input type='date' value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} /></div>
              <div><label className='text-sm font-medium mb-1 block'>Qualification</label><Input value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} /></div>
              <div><label className='text-sm font-medium mb-1 block'>Designation</label><Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div>
              <div><label className='text-sm font-medium mb-1 block'>Salary</label><Input type='number' value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} /></div>
              <div>
                <label htmlFor="department-select" className='text-sm font-medium mb-1 block'>Department</label>
                <select 
                  id="department-select"
                  name="department"
                  title="Select department"
                  aria-label="Select department"
                  className='w-full h-10 rounded-md border px-3 bg-background' 
                  value={formData.departmentId} 
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                >
                  <option value=''>Select department</option>
                  {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className='col-span-2'><label className='text-sm font-medium mb-1 block'>Address</label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => { resetForm(); setOpen(false) }}>Cancel</Button>
              <Button type='submit' disabled={loading} className='bg-gradient-to-r from-violet-600 to-purple-600'>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}