'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function EventsClient({ data }: any) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', eventType: 'academic', startDate: '', endDate: '', venue: '', organizer: '' })

  const resetForm = () => { setFormData({ title: '', description: '', eventType: 'academic', startDate: '', endDate: '', venue: '', organizer: '' }); setEditingId(null) }

  const handleEdit = (event: any) => {
    setEditingId(event.id)
    setFormData({
      title: event.title || '', description: event.description || '', eventType: event.eventType || 'academic',
      startDate: event.startDate?.split('T')[0] || '', endDate: event.endDate?.split('T')[0] || '',
      venue: event.venue || '', organizer: event.organizer || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.endDate) { toast.error('Title and dates required'); return }
    setLoading(true)
    try {
      const url = editingId ? '/api/events/' + editingId : '/api/events'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingId ? 'Updated!' : 'Created!'); resetForm(); setShowForm(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await fetch('/api/events/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  const events = Array.isArray(data) ? data : []

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Events ({events.length})</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}><Plus className='mr-2 h-4 w-4' />{showForm ? 'Cancel' : 'Add Event'}</Button>
      </div>

      {showForm && (
        <Card className='border-2 border-blue-200'>
          <CardHeader><CardTitle>{editingId ? 'Edit Event' : 'Add New Event'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4 max-w-lg'>
              <div><label className='block text-sm mb-1'>Title *</label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div><label className='block text-sm mb-1'>Description</label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className='grid grid-cols-2 gap-4'>
                <div><label className='block text-sm mb-1'>Type</label><select className='w-full h-10 rounded-md border px-3' value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}><option value='academic'>Academic</option><option value='sports'>Sports</option><option value='cultural'>Cultural</option><option value='holiday'>Holiday</option><option value='meeting'>Meeting</option></select></div>
                <div><label className='block text-sm mb-1'>Organizer</label><Input value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} /></div>
                <div><label className='block text-sm mb-1'>Start Date *</label><Input type='date' value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required /></div>
                <div><label className='block text-sm mb-1'>End Date *</label><Input type='date' value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required /></div>
                <div className='col-span-2'><label className='block text-sm mb-1'>Venue</label><Input value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} /></div>
              </div>
              <div className='flex gap-2'><Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button><Button type='button' variant='outline' onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {events.map((event: any) => (
          <Card key={event.id}>
            <CardHeader>
              <div className='flex justify-between'>
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <p className='text-sm text-muted-foreground'>{format(new Date(event.startDate), 'MMM dd, yyyy')} - {format(new Date(event.endDate), 'MMM dd, yyyy')} | {event.venue}</p>
                </div>
                <div className='flex gap-2'>
                  <Badge>{event.eventType}</Badge>
                  <Button variant='ghost' size='icon' onClick={() => handleEdit(event)}><Pencil className='h-4 w-4' /></Button>
                  <Button variant='ghost' size='icon' onClick={() => handleDelete(event.id)}><Trash2 className='h-4 w-4 text-red-500' /></Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
