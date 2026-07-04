'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export function HostelClient({ data }: any) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'boys', wardenName: '', wardenPhone: '', capacity: 50, fee: 0 })

  const resetForm = () => { setFormData({ name: '', type: 'boys', wardenName: '', wardenPhone: '', capacity: 50, fee: 0 }); setEditingId(null) }

  const handleEdit = (hostel: any) => {
    setEditingId(hostel.id)
    setFormData({ name: hostel.name, type: hostel.type, wardenName: hostel.wardenName || '', wardenPhone: hostel.wardenPhone || '', capacity: hostel.capacity, fee: hostel.fee || 0 })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? '/api/hostels/' + editingId : '/api/hostels'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingId ? 'Updated!' : 'Created!'); resetForm(); setShowForm(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await fetch('/api/hostels/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  const hostels = Array.isArray(data) ? data : []

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Hostels ({hostels.length})</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}><Plus className='mr-2 h-4 w-4' />{showForm ? 'Cancel' : 'Add Hostel'}</Button>
      </div>

      {showForm && (
        <Card className='border-2 border-blue-200'>
          <CardHeader><CardTitle>{editingId ? 'Edit Hostel' : 'Add New Hostel'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4 max-w-lg'>
              <div className='grid grid-cols-2 gap-4'>
                <div><label className='block text-sm mb-1'>Name *</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div><label className='block text-sm mb-1'>Type</label><select className='w-full h-10 rounded-md border px-3' value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value='boys'>Boys</option><option value='girls'>Girls</option></select></div>
                <div><label className='block text-sm mb-1'>Warden Name</label><Input value={formData.wardenName} onChange={e => setFormData({...formData, wardenName: e.target.value})} /></div>
                <div><label className='block text-sm mb-1'>Warden Phone</label><Input value={formData.wardenPhone} onChange={e => setFormData({...formData, wardenPhone: e.target.value})} /></div>
                <div><label className='block text-sm mb-1'>Capacity</label><Input type='number' value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} /></div>
                <div><label className='block text-sm mb-1'>Fee/Month</label><Input type='number' value={formData.fee} onChange={e => setFormData({...formData, fee: Number(e.target.value)})} /></div>
              </div>
              <div className='flex gap-2'><Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button><Button type='button' variant='outline' onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {hostels.map((hostel: any) => (
          <Card key={hostel.id}>
            <CardHeader>
              <div className='flex justify-between'>
                <div>
                  <CardTitle>{hostel.name} <Badge className='ml-2'>{hostel.type}</Badge></CardTitle>
                  <p className='text-sm text-muted-foreground'>Warden: {hostel.wardenName || 'N/A'} | Capacity: {hostel.occupied || 0}/{hostel.capacity} | Fee: ${hostel.fee || 0}/mo</p>
                </div>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='icon' onClick={() => handleEdit(hostel)}><Pencil className='h-4 w-4' /></Button>
                  <Button variant='ghost' size='icon' onClick={() => handleDelete(hostel.id)}><Trash2 className='h-4 w-4 text-red-500' /></Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
