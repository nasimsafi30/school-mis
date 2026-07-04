'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function PayrollClient({ data = [], teachers = [] }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(),
    basicSalary: 0, allowances: 0, deductions: 0,
  })

  const netSalary = (Number(formData.basicSalary) || 0) + (Number(formData.allowances) || 0) - (Number(formData.deductions) || 0)

  const resetForm = () => {
    setFormData({ employeeId: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), basicSalary: 0, allowances: 0, deductions: 0 })
    setEditingId(null)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    setFormData({
      employeeId: record.employeeId,
      month: record.month,
      year: record.year,
      basicSalary: Number(record.basicSalary),
      allowances: Number(record.allowances),
      deductions: Number(record.deductions),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!formData.employeeId) { toast.error('Please select an employee'); return }
    setLoading(true)
    try {
      const payload = { ...formData, netSalary }
      const url = editingId ? '/api/payroll/' + editingId : '/api/payroll'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingId ? 'Payroll updated!' : 'Payroll processed!')
        setOpen(false); resetForm(); router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payroll record?')) return
    try {
      const res = await fetch('/api/payroll/' + id, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); router.refresh() }
      else { const err = await res.json(); toast.error(err.error || 'Failed') }
    } catch { toast.error('Error') }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch('/api/payroll/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
      if (res.ok) { toast.success('Marked as paid'); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') }
  }

  const currentMonth = MONTHS[new Date().getMonth()]
  const totalPayroll = data.filter((p: any) => p.month === currentMonth).reduce((s: number, p: any) => s + Number(p.netSalary), 0)

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Payroll</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}>
          <Plus className='mr-2 h-4 w-4' />Process Payroll
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <Card className='bg-green-50 dark:bg-green-950'><CardHeader className='pb-2'><CardTitle className='text-sm'>Current Month</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold'>{formatCurrency(totalPayroll)}</div></CardContent></Card>
        <Card className='bg-blue-50 dark:bg-blue-950'><CardHeader className='pb-2'><CardTitle className='text-sm'>Records</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold'>{data.length}</div></CardContent></Card>
        <Card className='bg-purple-50 dark:bg-purple-950'><CardHeader className='pb-2'><CardTitle className='text-sm'>Paid</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold'>{data.filter((p: any) => p.status === 'paid').length}</div></CardContent></Card>
      </div>

      {/* Payroll List */}
      <div className='space-y-4'>
        {data.length === 0 ? (
          <Card><CardContent className='text-center py-8 text-muted-foreground'>No payroll records</CardContent></Card>
        ) : (
          data.map((p: any) => (
            <Card key={p.id}>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle className='text-lg'>{p.employee?.firstName} {p.employee?.lastName}</CardTitle>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {p.month} {p.year} | Basic: {formatCurrency(Number(p.basicSalary))} | 
                      Allowances: {formatCurrency(Number(p.allowances))} | 
                      Deductions: {formatCurrency(Number(p.deductions))}
                    </p>
                    <p className='text-lg font-bold mt-1'>Net: {formatCurrency(Number(p.netSalary))}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge className={p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {p.status === 'paid' ? <CheckCircle className='mr-1 h-3 w-3' /> : <Clock className='mr-1 h-3 w-3' />}
                      {p.status}
                    </Badge>
                    <Button variant='ghost' size='icon' onClick={() => handleEdit(p)} title='Edit'><Pencil className='h-4 w-4' /></Button>
                    {p.status !== 'paid' && (
                      <Button variant='ghost' size='sm' onClick={() => handleMarkPaid(p.id)} className='text-green-600'>Mark Paid</Button>
                    )}
                    <Button variant='ghost' size='icon' onClick={() => handleDelete(p.id)} title='Delete' className='text-red-500'><Trash2 className='h-4 w-4' /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='z-[100] max-w-md'>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Payroll' : 'Process Payroll'}</DialogTitle></DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm mb-1 block'>Employee *</label>
              <select className='w-full h-10 rounded-md border px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white' value={formData.employeeId}
                onChange={e => { setFormData({...formData, employeeId: e.target.value}); const t = teachers.find((x: any) => x.id === e.target.value); if (t?.salary) setFormData(p => ({...p, basicSalary: Math.round(Number(t.salary)/12)})) }}
                aria-label='Select employee' title='Select employee'>
                <option value=''>Select employee</option>
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.employeeId})</option>)}
              </select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm mb-1 block'>Month</label>
                <select className='w-full h-10 rounded-md border px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white' value={formData.month}
                  onChange={e => setFormData({...formData, month: e.target.value})}
                  aria-label='Select month' title='Select month'>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className='text-sm mb-1 block'>Year</label><Input type='number' value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} /></div>
              <div><label className='text-sm mb-1 block'>Basic Salary</label><Input type='number' value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: Number(e.target.value)})} /></div>
              <div><label className='text-sm mb-1 block'>Allowances</label><Input type='number' value={formData.allowances} onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} /></div>
              <div><label className='text-sm mb-1 block'>Deductions</label><Input type='number' value={formData.deductions} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} /></div>
              <div className='flex items-end'><div className='p-3 bg-gray-100 dark:bg-gray-800 rounded w-full text-center'><span className='text-sm'>Net: </span><span className='text-xl font-bold'>${netSalary.toLocaleString()}</span></div></div>
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleSave} disabled={loading} className='flex-1'>{loading ? 'Saving...' : editingId ? 'Update' : 'Process'}</Button>
              <Button variant='outline' onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
