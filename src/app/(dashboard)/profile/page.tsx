'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Shield, Calendar, Activity, Settings, Bell, LogOut, Loader2 } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile/photo')
      .then(r => r.json())
      .then(d => { if (d.photoUrl) setPhotoUrl(d.photoUrl) })
      .catch(() => {})
  }, [])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      router.push('/login')
    }
    return null
  }

  if (!session) return null

  const initials = session.user?.email?.substring(0, 2).toUpperCase() || 'U'
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className='space-y-6 animate-in'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white shadow-xl shadow-blue-500/20'>
        <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <h1 className='text-3xl font-bold'>My Profile</h1>
          <p className='text-blue-200 mt-2'>View and manage your account information</p>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left Column */}
        <div className='lg:col-span-1 space-y-6'>
          <Card className='border-0 shadow-md overflow-hidden'>
            <div className='h-24 bg-gradient-to-br from-blue-500 to-indigo-600' />
            <CardContent className='-mt-12 text-center pb-6'>
              <Avatar className='h-24 w-24 mx-auto ring-4 ring-white dark:ring-gray-900 shadow-xl'>
                <AvatarImage src={photoUrl || undefined} className='object-cover' />
                <AvatarFallback className='text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className='text-xl font-bold mt-4'>{session.user?.email}</h2>
              <Badge className='mt-2 capitalize text-sm px-3 py-1' variant='secondary'>
                {session.user?.role || 'User'}
              </Badge>
              
              <div className='grid grid-cols-2 gap-4 mt-6 text-center'>
                <div className='p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl'>
                  <Activity className='h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1' />
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <p className='font-bold text-sm text-green-600'>Active</p>
                </div>
                <div className='p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl'>
                  <Calendar className='h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1' />
                  <p className='text-xs text-muted-foreground'>Member Since</p>
                  <p className='font-bold text-sm'>{joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-0 shadow-md'>
            <CardContent className='p-4 space-y-2'>
              <Button variant='ghost' className='w-full justify-start' onClick={() => router.push('/settings')}>
                <Settings className='mr-2 h-4 w-4' /> Account Settings
              </Button>
              <Button variant='ghost' className='w-full justify-start' onClick={() => router.push('/notifications')}>
                <Bell className='mr-2 h-4 w-4' /> Notifications
              </Button>
              <Button variant='ghost' className='w-full justify-start text-red-500' onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className='mr-2 h-4 w-4' /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='lg:col-span-2 space-y-6'>
          <Card className='border-0 shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-blue-500' /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground flex items-center gap-2'>
                    <Mail className='h-4 w-4' /> Email Address
                  </Label>
                  <Input value={session.user?.email || ''} disabled className='bg-muted/50' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground flex items-center gap-2'>
                    <Shield className='h-4 w-4' /> Account Role
                  </Label>
                  <Input value={session.user?.role || ''} disabled className='bg-muted/50 capitalize' />
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <h3 className='font-semibold'>Account Activity</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-green-100 dark:bg-green-900/50 rounded-lg'>
                        <Activity className='h-4 w-4 text-green-600' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Last Login</p>
                        <p className='text-xs text-muted-foreground'>Today at 10:30 AM</p>
                      </div>
                    </div>
                    <Badge variant='success'>Active</Badge>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg'>
                        <Shield className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Account Created</p>
                        <p className='text-xs text-muted-foreground'>{joinDate}</p>
                      </div>
                    </div>
                    <Badge variant='info'>Verified</Badge>
                  </div>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600' onClick={() => router.push('/settings')}>
                  Edit Profile
                </Button>
                <Button variant='outline' className='flex-1' onClick={() => router.push('/settings')}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
