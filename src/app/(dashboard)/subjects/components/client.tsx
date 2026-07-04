'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, BookOpen, GraduationCap, Clock } from 'lucide-react'
import { SubjectForm } from './subject-form'
import { columns, SubjectColumn } from './columns'
import { toast } from 'sonner'

export function SubjectsClient({ data, classes, teachers }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)

  const totalSubjects = data.length
  const mandatorySubjects = data.filter((s: any) => !s.isOptional).length
  const optionalSubjects = data.filter((s: any) => s.isOptional).length

  const formattedData: SubjectColumn[] = data.map((subject: any) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    class: subject.class?.name || 'N/A',
    teacher: subject.teacher
      ? subject.teacher.firstName + ' ' + subject.teacher.lastName
      : 'Not Assigned',
    isOptional: subject.isOptional,
    credits: subject.credits || 0,
  }))

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/subjects/' + id, { method: 'DELETE' })
      toast.success('Subject deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete subject')
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Subjects</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Manage subjects and curriculum
          </p>
        </div>
        <Button onClick={() => { setSelectedSubject(null); setOpen(true) }}>
          <Plus className='mr-2 h-4 w-4' />
          Add Subject
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Subjects</CardTitle>
            <BookOpen className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalSubjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mandatory</CardTitle>
            <GraduationCap className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mandatorySubjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Optional</CardTitle>
            <Clock className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{optionalSubjects}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
        data={formattedData}
        searchKey='name'
        searchPlaceholder='Search subjects...'
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{selectedSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          </DialogHeader>
          <SubjectForm
            initialData={selectedSubject}
            classes={classes}
            teachers={teachers}
            onSuccess={() => {
              setOpen(false)
              setSelectedSubject(null)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}