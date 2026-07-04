'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil, BookOpen, BookCopy } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function LibraryClient({ books, issuedBooks }: any) {
  const router = useRouter()
  const [tab, setTab] = useState('books')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ isbn: '', title: '', author: '', publisher: '', category: '', totalCopies: 1, shelfNo: '' })

  const resetForm = () => { setFormData({ isbn: '', title: '', author: '', publisher: '', category: '', totalCopies: 1, shelfNo: '' }); setEditingId(null) }

  const handleEdit = (book: any) => {
    setEditingId(book.id)
    setFormData({ isbn: book.isbn, title: book.title, author: book.author, publisher: book.publisher || '', category: book.category || '', totalCopies: book.totalCopies, shelfNo: book.shelfNo || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.author || !formData.isbn) { toast.error('Title, author, ISBN required'); return }
    setLoading(true)
    try {
      const url = editingId ? '/api/books/' + editingId : '/api/books'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...formData, availableCopies: formData.totalCopies}) })
      if (res.ok) { toast.success(editingId ? 'Updated!' : 'Created!'); resetForm(); setShowForm(false); router.refresh() }
      else { toast.error('Failed') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await fetch('/api/books/' + id, { method: 'DELETE' }); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
  }

  const booksList = Array.isArray(books) ? books : []
  const issuedList = Array.isArray(issuedBooks) ? issuedBooks : []

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Library</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}><Plus className='mr-2 h-4 w-4' />{showForm ? 'Cancel' : 'Add Book'}</Button>
      </div>

      <div className='flex gap-2'>
        <Button variant={tab === 'books' ? 'default' : 'outline'} onClick={() => setTab('books')}><BookOpen className='mr-2 h-4 w-4' />Books ({booksList.length})</Button>
        <Button variant={tab === 'issued' ? 'default' : 'outline'} onClick={() => setTab('issued')}><BookCopy className='mr-2 h-4 w-4' />Issued ({issuedList.length})</Button>
      </div>

      {showForm && (
        <Card className='border-2 border-blue-200'>
          <CardHeader><CardTitle>{editingId ? 'Edit Book' : 'Add New Book'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4 max-w-lg'>
              <div className='grid grid-cols-2 gap-4'>
                <div><label className='block text-sm mb-1'>ISBN *</label><Input value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} required /></div>
                <div><label className='block text-sm mb-1'>Title *</label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div><label className='block text-sm mb-1'>Author *</label><Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required /></div>
                <div><label className='block text-sm mb-1'>Publisher</label><Input value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} /></div>
                <div><label className='block text-sm mb-1'>Category</label><Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                <div><label className='block text-sm mb-1'>Copies</label><Input type='number' value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: Number(e.target.value)})} /></div>
                <div><label className='block text-sm mb-1'>Shelf No</label><Input value={formData.shelfNo} onChange={e => setFormData({...formData, shelfNo: e.target.value})} /></div>
              </div>
              <div className='flex gap-2'><Button type='submit' disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button><Button type='button' variant='outline' onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'books' && (
        <div className='space-y-4'>
          {booksList.map((book: any) => (
            <Card key={book.id}>
              <CardHeader>
                <div className='flex justify-between'>
                  <div>
                    <CardTitle>{book.title}</CardTitle>
                    <p className='text-sm text-muted-foreground'>by {book.author} | ISBN: {book.isbn} | Available: {book.availableCopies}/{book.totalCopies}</p>
                  </div>
                  <div className='flex gap-2'>
                    <Badge>{book.availableCopies > 0 ? 'Available' : 'Issued'}</Badge>
                    <Button variant='ghost' size='icon' onClick={() => handleEdit(book)}><Pencil className='h-4 w-4' /></Button>
                    <Button variant='ghost' size='icon' onClick={() => handleDelete(book.id)}><Trash2 className='h-4 w-4 text-red-500' /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {tab === 'issued' && (
        <div className='space-y-4'>
          {issuedList.map((issue: any) => (
            <Card key={issue.id}>
              <CardHeader>
                <div className='flex justify-between'>
                  <div>
                    <CardTitle>{issue.book?.title}</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Borrower: {issue.student?.firstName} {issue.student?.lastName} {issue.teacher?.firstName} {issue.teacher?.lastName} | 
                      Due: {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={issue.status === 'issued' ? 'bg-blue-100' : 'bg-green-100'}>{issue.status}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
