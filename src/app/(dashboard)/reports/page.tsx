'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, BarChart3, TrendingUp, Users, FileText, Eye, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const reports = [
  { 
    title: 'Student Enrollment', 
    desc: 'Monthly enrollment statistics and trends',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  { 
    title: 'Attendance Report', 
    desc: 'Daily attendance summary and analysis',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  { 
    title: 'Fee Collection', 
    desc: 'Revenue tracking and pending payments',
    icon: BarChart3,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  { 
    title: 'Exam Results', 
    desc: 'Performance analysis across all subjects',
    icon: FileText,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  { 
    title: 'Teacher Performance', 
    desc: 'Faculty evaluation and metrics',
    icon: Users,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  { 
    title: 'Library Report', 
    desc: 'Book circulation and inventory statistics',
    icon: BarChart3,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
]

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])

  const handleGenerate = async (reportTitle: string) => {
    setGenerating(reportTitle)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setGenerating(null)
    setGenerated(prev => [...prev, reportTitle])
    toast.success(`${reportTitle} report generated!`)
  }

  const handleExportAll = async () => {
    setGenerating('all')
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setGenerating(null)
    setGenerated(reports.map(r => r.title))
    toast.success('All reports exported successfully!')
  }

  const handlePreview = (reportTitle: string) => {
    toast.info(`Previewing ${reportTitle}...`)
  }

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white shadow-xl shadow-cyan-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Reports & Analytics</h1>
            <p className='text-cyan-200 mt-2'>Generate insights and download detailed reports</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <BarChart3 className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{reports.length}</p>
                  <p className='text-xs text-cyan-200'>Report Types</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <CheckCircle className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{generated.length}</p>
                  <p className='text-xs text-cyan-200'>Generated</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>📊</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-1 bg-cyan-500 rounded-full' />
          <p className='text-sm text-muted-foreground'>Select a report to generate</p>
        </div>
        <Button 
          onClick={handleExportAll}
          disabled={generating === 'all'}
          className='bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20'
        >
          {generating === 'all' ? (
            <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Exporting...</>
          ) : (
            <><Download className='mr-2 h-4 w-4' />Export All</>
          )}
        </Button>
      </div>

      {/* Reports Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {reports.map((report) => {
          const Icon = report.icon
          const isGenerated = generated.includes(report.title)
          const isGenerating = generating === report.title

          return (
            <Card 
              key={report.title} 
              className={`group card-hover border-0 shadow-md overflow-hidden transition-all ${
                isGenerated ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className={`h-2 bg-gradient-to-r ${report.color}`} />
              <CardContent className='p-6'>
                <div className='flex items-start gap-4 mb-4'>
                  <div className={`p-3 rounded-xl ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.iconColor}`} />
                  </div>
                  <div className='flex-1'>
                    <CardTitle className='text-lg mb-1'>
                      {report.title}
                      {isGenerated && <CheckCircle className='inline ml-2 h-4 w-4 text-green-500' />}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>{report.desc}</p>
                  </div>
                </div>
                <div className='flex items-center justify-between pt-4 border-t dark:border-gray-700'>
                  <span className='text-xs text-muted-foreground'>
                    {isGenerated ? 'Generated' : 'Last generated: Never'}
                  </span>
                  <div className='flex gap-2'>
                    <Button 
                      variant='ghost' 
                      size='sm' 
                      className='text-cyan-600 hover:text-cyan-700'
                      onClick={() => handlePreview(report.title)}
                    >
                      <Eye className='mr-1 h-3 w-3' /> Preview
                    </Button>
                    <Button 
                      size='sm' 
                      className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      onClick={() => handleGenerate(report.title)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <><Loader2 className='mr-1 h-3 w-3 animate-spin' /> Generating</>
                      ) : (
                        <><Download className='mr-1 h-3 w-3' /> {isGenerated ? 'Regenerate' : 'Generate'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
