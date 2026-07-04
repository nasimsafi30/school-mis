'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import { columns, FeeColumn } from './columns'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

const FEE_TYPES = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Hostel Fee', 'Sports Fee', 'Other']

export function FeesClient({ data, students }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [editingFee, setEditingFee] = useState<any>(null)
  const [paymentFee, setPaymentFee] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [formData, setFormData] = useState({
    studentId: '', feeType: '', amount: 0, dueDate: '', academicYear: '2024-2025', remarks: '',
  })

  const resetForm = () => { setFormData({ studentId: '', feeType: '', amount: 0, dueDate: '', academicYear: '2024-2025', remarks: '' }); setEditingFee(null) }

  const totalCollected = data.filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + Number(f.paidAmount), 0)
  const totalPending = data.filter((f: any) => f.status !== 'paid').reduce((s: number, f: any) => s + (Number(f.amount) - Number(f.paidAmount)), 0)

  const formatted: FeeColumn[] = data.map((f: any) => ({
    id: f.id, studentName: f.student?.firstName + ' ' + f.student?.lastName,
    className: f.student?.class?.name || 'N/A', feeType: f.feeType,
    amount: Number(f.amount), paidAmount: Number(f.paidAmount),
    balance: Number(f.amount) - Number(f.paidAmount),
    dueDate: f.dueDate, paidDate: f.paidDate || 'N/A', status: f.status, academicYear: f.academicYear,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = editingFee ? '/api/fees/' + editingFee.id : '/api/fees'
      const res = await fetch(url, { method: editingFee ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editingFee ? 'Updated!' : 'Created!'); resetForm(); setOpen(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const handlePayment = async () => {
    if (!paymentFee || paymentAmount <= 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/fees/' + paymentFee.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: paymentAmount }) })
      if (res.ok) { toast.success('Payment recorded!'); setShowPayment(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await fetch('/api/fees/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Fee Management</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}><Plus className='mr-2 h-4 w-4' />Add Fee</Button>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <Card className='bg-green-50'><CardHeader className='pb-2'><CardTitle className='text-sm'>Collected</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold text-green-700'>{formatCurrency(totalCollected)}</div></CardContent></Card>
        <Card className='bg-yellow-50'><CardHeader className='pb-2'><CardTitle className='text-sm'>Pending</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold text-yellow-700'>{formatCurrency(totalPending)}</div></CardContent></Card>
        <Card className='bg-blue-50'><CardHeader className='pb-2'><CardTitle className='text-sm'>Records</CardTitle></CardHeader><CardContent><div className='text-2xl font-bold text-blue-700'>{data.length}</div></CardContent></Card>
      </div>

      <DataTable columns={columns({ onDelete: handleDelete, onPayment: (fee: any) => { setPaymentFee(fee); setPaymentAmount(Number(fee.amount) - Number(fee.paidAmount)); setShowPayment(true) } })} data={formatted} searchKey='studentName' />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader><DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Student *</Label>
                <select aria-label='Student' className='w-full h-10 rounded-md border px-3' value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required>
                  <option value=''>Select student</option>
                  {students?.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                </select>
              </div>
              <div>
                <Label>Fee Type *</Label>
                <select aria-label='Fee type' className='w-full h-10 rounded-md border px-3' value={formData.feeType} onChange={e => setFormData({...formData, feeType: e.target.value})} required>
                  <option value=''>Select type</option>
                  {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Amount *</Label><Input type='number' value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required /></div>
              <div><Label>Due Date *</Label><Input type='date' value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required /></div>
              <div><Label>Academic Year</Label><Input value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} /></div>
              <div><Label>Remarks</Label><Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} /></div>
            </div>
            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={() => { resetForm(); setOpen(false) }}>Cancel</Button>
              <Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingFee ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className='space-y-4'>
            {paymentFee && <p className='text-sm'>Balance: {formatCurrency(Number(paymentFee.amount) - Number(paymentFee.paidAmount))}</p>}
            <div><Label>Amount</Label><Input type='number' value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} /></div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setShowPayment(false)}>Cancel</Button>
              <Button onClick={handlePayment} disabled={loading}>{loading ? 'Processing...' : 'Record Payment'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
