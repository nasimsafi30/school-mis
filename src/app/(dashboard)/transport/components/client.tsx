'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Bus, User, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export function TransportClient({ data }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ routeName: '', routeNo: '', vehicleNo: '', driverName: '', driverPhone: '', capacity: 40 })

  const routes = Array.isArray(data) ? data : []

  const resetForm = () => {
    setFormData({ routeName: '', routeNo: '', vehicleNo: '', driverName: '', driverPhone: '', capacity: 40 })
    setEditingId(null)
  }

  const handleEdit = (route: any) => {
    setEditingId(route.id)
    setFormData({
      routeName: route.routeName || '', routeNo: route.routeNo || '', vehicleNo: route.vehicleNo || '',
      driverName: route.driverName || '', driverPhone: route.driverPhone || '', capacity: route.capacity || 40,
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.routeName || !formData.routeNo || !formData.vehicleNo || !formData.driverName) {
      toast.error('Please fill all required fields'); return
    }
    setLoading(true)
    try {
      const url = editingId ? '/api/transport/' + editingId : '/api/transport'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingId ? 'Updated!' : 'Created!'); resetForm(); setOpen(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return
    try { await fetch('/api/transport/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  return (
    <div className='space-y-6'>
      {/* Action Bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-1 bg-sky-500 rounded-full' />
          <p className='text-sm text-muted-foreground'>{routes.length} routes found</p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true) }} className='bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg shadow-sky-500/20'>
          <Plus className='mr-2 h-4 w-4' />Add Route
        </Button>
      </div>

      {/* Routes Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {routes.map((route: any) => (
          <Card key={route.id} className='group card-hover border-0 shadow-md overflow-hidden'>
            <div className='h-2 bg-gradient-to-r from-sky-500 to-blue-600' />
            <CardContent className='p-6'>
              {/* Route Header */}
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-sky-100 dark:bg-sky-900/50 rounded-xl'>
                      <Bus className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                    </div>
                    <div>
                      <h3 className='font-bold text-lg'>{route.routeName}</h3>
                      <Badge variant='outline' className='font-mono text-xs'>{route.routeNo}</Badge>
                    </div>
                  </div>
                </div>
                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => handleEdit(route)}>
                    <Pencil className='h-4 w-4 text-sky-600' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => handleDelete(route.id)}>
                    <Trash2 className='h-4 w-4 text-rose-500' />
                  </Button>
                </div>
              </div>

              {/* Route Details */}
              <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='p-1.5 bg-white dark:bg-gray-700 rounded-lg'>
                    <Bus className='h-4 w-4 text-sky-500' />
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Vehicle</p>
                    <p className='text-sm font-medium'>{route.vehicleNo}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='p-1.5 bg-white dark:bg-gray-700 rounded-lg'>
                    <User className='h-4 w-4 text-sky-500' />
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Driver</p>
                    <p className='text-sm font-medium'>{route.driverName}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='p-1.5 bg-white dark:bg-gray-700 rounded-lg'>
                    <Phone className='h-4 w-4 text-sky-500' />
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Phone</p>
                    <p className='text-sm font-medium'>{route.driverPhone}</p>
                  </div>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className='mt-4'>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-muted-foreground'>Capacity</span>
                  <span className='font-medium'>{route.occupied || 0}/{route.capacity}</span>
                </div>
                <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div 
                    className='h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all'
                    style={{ width: `${((route.occupied || 0) / (route.capacity || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {routes.length === 0 && (
        <Card className='border-0 shadow-md'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='text-6xl mb-4'>🚌</div>
            <p className='text-lg font-medium text-muted-foreground'>No routes found</p>
            <p className='text-sm text-muted-foreground mt-1'>Add your first transport route</p>
            <Button onClick={() => { resetForm(); setOpen(true) }} className='mt-4 bg-gradient-to-r from-sky-600 to-blue-600'>
              <Plus className='mr-2 h-4 w-4' />Add Route
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Route' : 'Add New Route'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div><label className='text-sm font-medium mb-1 block'>Route Name *</label><Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} required /></div>
            <div><label className='text-sm font-medium mb-1 block'>Route No *</label><Input value={formData.routeNo} onChange={e => setFormData({...formData, routeNo: e.target.value})} required /></div>
            <div><label className='text-sm font-medium mb-1 block'>Vehicle No *</label><Input value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} required /></div>
            <div><label className='text-sm font-medium mb-1 block'>Driver Name *</label><Input value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} required /></div>
            <div><label className='text-sm font-medium mb-1 block'>Driver Phone</label><Input value={formData.driverPhone} onChange={e => setFormData({...formData, driverPhone: e.target.value})} /></div>
            <div><label className='text-sm font-medium mb-1 block'>Capacity</label><Input type='number' value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} /></div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => { resetForm(); setOpen(false) }}>Cancel</Button>
              <Button type='submit' disabled={loading} className='bg-gradient-to-r from-sky-600 to-blue-600'>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
