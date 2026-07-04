'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { Download, Printer, Calendar, TrendingUp, Users, DollarSign, BookOpen } from 'lucide-react'

interface ReportsClientProps {
  stats: any
}

export function ReportsClient({ stats }: ReportsClientProps) {
  const [period, setPeriod] = useState('monthly')

  const enrollmentData = [
    { month: 'Jan', students: 450, admissions: 25 },
    { month: 'Feb', students: 470, admissions: 20 },
    { month: 'Mar', students: 490, admissions: 20 },
    { month: 'Apr', students: 510, admissions: 20 },
    { month: 'May', students: 530, admissions: 20 },
    { month: 'Jun', students: 550, admissions: 20 },
  ]

  const attendanceData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 10 },
    { name: 'Late', value: 3 },
    { name: 'Half Day', value: 2 },
  ]

  const feeData = [
    { month: 'Jan', collected: 45000, pending: 15000 },
    { month: 'Feb', collected: 52000, pending: 8000 },
    { month: 'Mar', collected: 48000, pending: 12000 },
    { month: 'Apr', collected: 61000, pending: 9000 },
    { month: 'May', collected: 55000, pending: 15000 },
    { month: 'Jun', collected: 67000, pending: 3000 },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Reports & Analytics</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            View school statistics and performance metrics
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='daily'>Daily</SelectItem>
              <SelectItem value='weekly'>Weekly</SelectItem>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='yearly'>Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline'><Printer className='mr-2 h-4 w-4' />Print</Button>
          <Button variant='outline'><Download className='mr-2 h-4 w-4' />Export</Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Students</CardTitle>
            <Users className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalStudents || 2450}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>\</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Attendance Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.attendancePercentage || 92}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Classes</CardTitle>
            <BookOpen className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalClasses || 32}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='enrollment' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='enrollment'>Enrollment</TabsTrigger>
          <TabsTrigger value='attendance'>Attendance</TabsTrigger>
          <TabsTrigger value='fees'>Fee Collection</TabsTrigger>
          <TabsTrigger value='academic'>Academic</TabsTrigger>
        </TabsList>

        <TabsContent value='enrollment'>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={enrollmentData}
                  xKey='month'
                  lines={[
                    { key: 'students', name: 'Students', color: '#3b82f6' },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={enrollmentData}
                  xKey='month'
                  bars={[
                    { key: 'admissions', name: 'New Admissions', color: '#10b981' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='attendance'>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={attendanceData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={[
                    { month: 'Jan', rate: 92 },
                    { month: 'Feb', rate: 88 },
                    { month: 'Mar', rate: 95 },
                    { month: 'Apr', rate: 90 },
                    { month: 'May', rate: 87 },
                    { month: 'Jun', rate: 93 },
                  ]}
                  xKey='month'
                  lines={[
                    { key: 'rate', name: 'Attendance Rate', color: '#8b5cf6' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='fees'>
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={feeData}
                xKey='month'
                bars={[
                  { key: 'collected', name: 'Collected', color: '#10b981' },
                  { key: 'pending', name: 'Pending', color: '#ef4444' },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='academic'>
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { subject: 'Math', average: 78, highest: 98, lowest: 45 },
                  { subject: 'Science', average: 82, highest: 95, lowest: 50 },
                  { subject: 'English', average: 75, highest: 92, lowest: 40 },
                  { subject: 'History', average: 80, highest: 96, lowest: 48 },
                  { subject: 'Geography', average: 77, highest: 94, lowest: 42 },
                ]}
                xKey='subject'
                bars={[
                  { key: 'average', name: 'Average', color: '#3b82f6' },
                  { key: 'highest', name: 'Highest', color: '#10b981' },
                  { key: 'lowest', name: 'Lowest', color: '#ef4444' },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
