import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from './components/overview'
import { RecentActivity } from './components/recent-activity'
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, UserCheck, Calendar, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold gradient-text'>Dashboard</h1>
          <p className='text-sm text-muted-foreground mt-1'>Welcome back, {session.user?.email}</p>
        </div>
        <div className='text-right'>
          <p className='text-sm font-medium'>Academic Year</p>
          <p className='text-2xl font-bold gradient-text'>2024-2025</p>
        </div>
      </div>

      {/* Modern Gradient Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Students Card */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-blue-100'>Total Students</p>
              <div className='p-2 bg-white/20 rounded-xl'>
                <Users className='h-5 w-5 text-white' />
              </div>
            </div>
            <p className='text-3xl font-bold mt-3'>2,450</p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full text-blue-100'>+12%</span>
              <p className='text-xs text-blue-200'>from last month</p>
            </div>
          </div>
        </div>

        {/* Teachers Card */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-emerald-100'>Total Teachers</p>
              <div className='p-2 bg-white/20 rounded-xl'>
                <GraduationCap className='h-5 w-5 text-white' />
              </div>
            </div>
            <p className='text-3xl font-bold mt-3'>85</p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full text-emerald-100'>+3</span>
              <p className='text-xs text-emerald-200'>new this month</p>
            </div>
          </div>
        </div>

        {/* Classes Card */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg shadow-violet-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-violet-100'>Active Classes</p>
              <div className='p-2 bg-white/20 rounded-xl'>
                <BookOpen className='h-5 w-5 text-white' />
              </div>
            </div>
            <p className='text-3xl font-bold mt-3'>32</p>
            <p className='text-xs text-violet-200 mt-2'>Across 5 grades</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg shadow-amber-500/20 card-hover'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-amber-100'>Revenue (MTD)</p>
              <div className='p-2 bg-white/20 rounded-xl'>
                <DollarSign className='h-5 w-5 text-white' />
              </div>
            </div>
            <p className='text-3xl font-bold mt-3'>$45,250</p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full text-amber-100'>+8%</span>
              <p className='text-xs text-amber-200'>from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='card-hover border-0 shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Today's Attendance</CardTitle>
            <div className='p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl'>
              <UserCheck className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>92%</div>
            <div className='mt-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full' style={{ width: '92%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className='card-hover border-0 shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Upcoming Events</CardTitle>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl'>
              <Calendar className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>5</div>
            <p className='text-xs text-muted-foreground'>This week</p>
          </CardContent>
        </Card>

        <Card className='card-hover border-0 shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Fee Collection</CardTitle>
            <div className='p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl'>
              <TrendingUp className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>78%</div>
            <div className='mt-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full' style={{ width: '78%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className='card-hover border-0 shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Issues</CardTitle>
            <div className='p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl'>
              <AlertCircle className='h-4 w-4 text-rose-600 dark:text-rose-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='bg-muted/50 p-1 rounded-xl'>
          <TabsTrigger value='overview' className='rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm'>Overview</TabsTrigger>
          <TabsTrigger value='analytics' className='rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm'>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4 card-hover border-0 shadow-md'>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className='pl-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-3 card-hover border-0 shadow-md'>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-4'>
          <Card className='card-hover border-0 shadow-md'>
            <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
            <CardContent><Overview /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}