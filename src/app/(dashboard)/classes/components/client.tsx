'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export function ClassesClient({ data }: any) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', numericName: '', capacity: '' })
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setFormData({ name: '', numericName: '', capacity: '' })
    setEditingId(null)
  }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (cls: any) => {
    console.log('Editing class:', cls)
    setEditingId(cls.id)
    setFormData({
      name: cls.name || '',
      numericName: String(cls.numericName || ''),
      capacity: String(cls.capacity || ''),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Class name is required')
      return
    }

    setLoading(true)
    
    const payload = {
      name: formData.name.trim(),
      numericName: parseInt(formData.numericName) || 0,
      capacity: parseInt(formData.capacity) || 30,
    }

    try {
      if (editingId) {
        // UPDATE
        console.log('Updating class:', editingId, payload)
        const res = await fetch('/api/classes/' + editingId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        
        if (res.ok) {
          toast.success('Class updated!')
          resetForm()
          setShowForm(false)
          router.refresh()
        } else {
          const err = await res.json()
          toast.error(err.error || 'Failed to update')
        }
      } else {
        // CREATE
        console.log('Creating class:', payload)
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        
        if (res.ok) {
          toast.success('Class created!')
          resetForm()
          setShowForm(false)
          router.refresh()
        } else {
          const err = await res.json()
          toast.error(err.error || 'Failed to create')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class? This cannot be undone.')) return
    try {
      const res = await fetch('/api/classes/' + id, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Class deleted!')
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const classes = Array.isArray(data) ? data : []

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Classes ({classes.length})</h1>
        <Button onClick={openAddForm}>
          <Plus className='mr-2 h-4 w-4' /> Add Class
        </Button>
      </div>

      {showForm && (
        <Card className='border-2 border-blue-200'>
          <CardHeader>
            <CardTitle className='text-blue-700'>
              {editingId ? '✏️ Edit Class' : '➕ Add New Class'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4 max-w-md'>
              <div>
                <label className='block text-sm font-medium mb-1'>Class Name *</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g., Grade 5'
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Numeric Name (Grade Number)</label>
                <Input
                  type='number'
                  value={formData.numericName}
                  onChange={e => setFormData({ ...formData, numericName: e.target.value })}
                  placeholder='e.g., 5'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Capacity</label>
                <Input
                  type='number'
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder='e.g., 60'
                />
              </div>
              <div className='flex gap-2 pt-2'>
                <Button type='submit' disabled={loading} size='lg'>
                  {loading ? '⏳ Saving...' : editingId ? '💾 Update Class' : '✅ Create Class'}
                </Button>
                <Button type='button' variant='outline' size='lg' onClick={() => { resetForm(); setShowForm(false) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {classes.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12 text-muted-foreground'>
              <p className='text-lg mb-2'>No classes found</p>
              <Button onClick={openAddForm}>Add Your First Class</Button>
            </CardContent>
          </Card>
        ) : (
          classes.map((cls: any) => (
            <Card key={cls.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-xl'>{cls.name}</CardTitle>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Grade {cls.numericName || 'N/A'} | Capacity: {cls.capacity || 'N/A'} | Sections: {(cls.sections || []).length}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={() => handleEdit(cls)}>
                      <Pencil className='mr-2 h-4 w-4' /> Edit
                    </Button>
                    <Button variant='destructive' size='sm' onClick={() => handleDelete(cls.id)}>
                      <Trash2 className='mr-2 h-4 w-4' /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
