'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string
}

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev: number) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead)
      for (const notif of unreadNotifications) {
        await fetch(`/api/notifications/${notif.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
      }
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      const deleted = notifications.find((n: Notification) => n.id === id)
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id))
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev: number) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      fetch(`/api/notifications/${notification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev: number) => Math.max(0, prev - 1))
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link)
    }
    setOpen(false)
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'fee':
        return '💰'
      case 'attendance':
        return '📋'
      case 'enrollment':
        return '🎓'
      case 'exam':
        return '📝'
      case 'result':
        return '📊'
      case 'library':
        return '📚'
      case 'event':
        return '📅'
      case 'timetable':
        return '🕐'
      case 'notice':
        return '📢'
      default:
        return '🔔'
    }
  }

  // Get color based on notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'fee':
        return 'bg-green-100 text-green-800'
      case 'attendance':
        return 'bg-blue-100 text-blue-800'
      case 'enrollment':
        return 'bg-purple-100 text-purple-800'
      case 'exam':
        return 'bg-orange-100 text-orange-800'
      case 'result':
        return 'bg-indigo-100 text-indigo-800'
      case 'library':
        return 'bg-amber-100 text-amber-800'
      case 'event':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="text-base font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto py-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Notification List */}
        <ScrollArea className="h-[350px]">
          <DropdownMenuGroup>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer transition-colors',
                    !notification.isRead && 'bg-blue-50/50 hover:bg-blue-100/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className={cn(
                    'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg',
                    getNotificationColor(notification.type)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {/* Unread indicator and delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                          onClick={(e) => deleteNotification(e, notification.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-0.5 px-2 text-blue-600 hover:text-blue-700"
                          onClick={(e) => markAsRead(e, notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>

        {/* Footer */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center py-3 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          onClick={() => {
            router.push('/notifications')
            setOpen(false)
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}