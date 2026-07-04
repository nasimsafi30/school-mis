import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, Trash2, DollarSign, Calendar, Users, BookOpen, Megaphone } from 'lucide-react'

const notifications = [
  { id: '1', title: 'New Student Admission', message: 'John Smith has been enrolled in Grade 5', type: 'enrollment', time: '5 min ago', read: false },
  { id: '2', title: 'Fee Payment Received', message: 'Fee payment of $5000 received from Emma Brown', type: 'fee', time: '1 hour ago', read: false },
  { id: '3', title: 'Exam Scheduled', message: 'Mid-term exam scheduled for Grade 5 on March 15', type: 'exam', time: '2 hours ago', read: true },
  { id: '4', title: 'Attendance Alert', message: 'Michael Lee was absent today', type: 'attendance', time: '3 hours ago', read: true },
  { id: '5', title: 'Library Book Returned', message: 'The Great Gatsby has been returned to the library', type: 'library', time: '5 hours ago', read: true },
  { id: '6', title: 'Event Reminder', message: 'Annual Sports Day is tomorrow at 9:00 AM', type: 'event', time: '6 hours ago', read: false },
]

const getIcon = (type: string) => {
  switch (type) {
    case 'fee': return <DollarSign className='h-5 w-5 text-green-500' />
    case 'attendance': return <Calendar className='h-5 w-5 text-blue-500' />
    case 'enrollment': return <Users className='h-5 w-5 text-purple-500' />
    case 'exam': return <BookOpen className='h-5 w-5 text-orange-500' />
    case 'event': return <Megaphone className='h-5 w-5 text-pink-500' />
    default: return <Bell className='h-5 w-5 text-gray-500' />
  }
}

const getIconBg = (type: string) => {
  switch (type) {
    case 'fee': return 'bg-green-100 dark:bg-green-900/50'
    case 'attendance': return 'bg-blue-100 dark:bg-blue-900/50'
    case 'enrollment': return 'bg-purple-100 dark:bg-purple-900/50'
    case 'exam': return 'bg-orange-100 dark:bg-orange-900/50'
    case 'event': return 'bg-pink-100 dark:bg-pink-900/50'
    default: return 'bg-gray-100 dark:bg-gray-900/50'
  }
}

const unreadCount = notifications.filter(n => !n.read).length

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 to-slate-700 p-8 text-white shadow-xl shadow-gray-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Notifications</h1>
            <p className='text-gray-200 mt-2'>Stay updated with school activities and alerts</p>
            <div className='flex items-center gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🔔</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{notifications.length}</p>
                  <p className='text-xs text-gray-200'>Total</p>
                </div>
              </div>
              <div className='w-px h-10 bg-white/20' />
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-white/20 rounded-lg'>
                  <span className='text-lg'>🔵</span>
                </div>
                <div>
                  <p className='text-2xl font-bold'>{unreadCount}</p>
                  <p className='text-xs text-gray-200'>Unread</p>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <div className='text-8xl opacity-20'>🔔</div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <Card className='border-0 shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>All Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant='secondary' className='cursor-pointer hover:bg-primary/20'>
              <Check className='mr-1 h-3 w-3' /> Mark all as read
            </Badge>
          )}
        </CardHeader>
        <CardContent className='p-4'>
          <div className='divide-y'>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className={`p-3 rounded-xl ${getIconBg(notif.type)} flex-shrink-0`}>
                  {getIcon(notif.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-semibold'>{notif.title}</h3>
                      {!notif.read && (
                        <Badge className='bg-blue-500 text-white text-xs'>New</Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <span className='text-xs text-muted-foreground'>{notif.time}</span>
                      <button className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors' title='Delete notification' aria-label='Delete notification'>
                        <Trash2 className='h-4 w-4 text-gray-400 hover:text-red-500' />
                      </button>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>{notif.message}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant='outline' className='text-xs capitalize'>{notif.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}