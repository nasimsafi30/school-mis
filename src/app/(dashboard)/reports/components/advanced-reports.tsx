'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { StatsCard } from '@/components/charts/stats-card'
import { Download, Printer, Users, DollarSign, TrendingUp, BookOpen, GraduationCap } from 'lucide-react'

export function AdvancedReports() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Advanced Analytics</h2>
        <div className='flex gap-2'>
          <Button variant='outline'><Printer className='mr-2 h-4 w-4' />Print</Button>
          <Button variant='outline'><Download className='mr-2 h-4 w-4' />Export CSV</Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Revenue'
          value='\,500'
          icon={DollarSign}
          trend={{ value: '12% vs last year', positive: true }}
          iconClassName='bg-green-100'
        />
        <StatsCard
          title='Student Growth'
          value='+15%'
          icon={TrendingUp}
          trend={{ value: '245 new admissions', positive: true }}
          iconClassName='bg-blue-100'
        />
        <StatsCard
          title='Teacher Ratio'
          value='1:28'
          icon={GraduationCap}
          description='Students per teacher'
          iconClassName='bg-purple-100'
        />
        <StatsCard
          title='Library Usage'
          value='1,234'
          icon={BookOpen}
          description='Books issued this month'
          iconClassName='bg-orange-100'
        />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader><CardTitle>Year-over-Year Comparison</CardTitle></CardHeader>
          <CardContent>
            <LineChart
              data={[
                { month: 'Q1', '2023': 400, '2024': 450 },
                { month: 'Q2', '2023': 420, '2024': 470 },
                { month: 'Q3', '2023': 440, '2024': 490 },
                { month: 'Q4', '2023': 460, '2024': 510 },
              ]}
              xKey='month'
              lines={[
                { key: '2023', name: '2023', color: '#94a3b8' },
                { key: '2024', name: '2024', color: '#3b82f6' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Department Distribution</CardTitle></CardHeader>
          <CardContent>
            <PieChart
              data={[
                { name: 'Science', value: 30 },
                { name: 'Math', value: 25 },
                { name: 'English', value: 20 },
                { name: 'History', value: 15 },
                { name: 'Arts', value: 10 },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
