'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, Trash2, Mail, Calendar, DollarSign, Users, BookOpen, Megaphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string
}

interface NotificationsClientProps {
  data: Notification[]
}

const getIcon = (type: string) => {
  switch (type) {
    case 'fee': return <DollarSign className='h-5 w-5 text-green-500' />
    case 'attendance': return <Calendar className='h-5 w-5 text-blue-500' />
    case 'enrollment': return <Users className='h-5 w-5 text-purple-500' />
    case 'exam': return <BookOpen className='h-5 w-5 text-orange-500' />
    case 'notice': return <Megaphone className='h-5 w-5 text-red-500' />
    case 'email': return <Mail className='h-5 w-5 text-indigo-500' />
    default: return <Bell className='h-5 w-5 text-gray-500' />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'fee': return 'bg-green-100 text-green-800'
    case 'attendance': return 'bg-blue-100 text-blue-800'
    case 'enrollment': return 'bg-purple-100 text-purple-800'
    case 'exam': return 'bg-orange-100 text-orange-800'
    case 'notice': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function NotificationsClient({ data }: NotificationsClientProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(data)
  const [filter, setFilter] = useState('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const readCount = notifications.filter((n) => n.isRead).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead)
      for (const n of unread) {
        await fetch('/api/notifications/' + n.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch('/api/notifications/' + id, { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Stay updated with school activities
            {unreadCount > 0 && (
              <Badge variant='destructive' className='ml-2'>{unreadCount} new</Badge>
            )}
          </p>
        </div>
        <div className='flex gap-2'>
          {unreadCount > 0 && (
            <Button variant='outline' onClick={markAllAsRead}>
              <Check className='mr-2 h-4 w-4' />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className='flex gap-2'>
        <Button variant={filter === 'all' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('all')}>
          All ({notifications.length})
        </Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('unread')}>
          Unread ({unreadCount})
        </Button>
        <Button variant={filter === 'read' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('read')}>
          Read ({readCount})
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <ScrollArea className='h-[600px]'>
            {filteredNotifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16'>
                <Bell className='h-16 w-16 text-muted-foreground/20 mb-4' />
                <p className='text-lg text-muted-foreground'>No notifications</p>
                <p className='text-sm text-muted-foreground mt-1'>
                  {filter === 'unread' ? 'All caught up!' : 'No notifications to show'}
                </p>
              </div>
            ) : (
              <div className='divide-y'>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleClick(notification)}
                  >
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>{notification.title}</h3>
                            {!notification.isRead && (
                              <Badge variant='info' className='text-xs'>New</Badge>
                            )}
                            <Badge variant='outline' className='text-xs capitalize'>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {notification.message}
                          </p>
                        </div>
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          {!notification.isRead && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Check className='h-4 w-4' />
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-red-500'
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground mt-2'>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}