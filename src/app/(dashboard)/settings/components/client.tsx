'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { User, Lock, Bell, Shield, Camera, Upload, Loader2, Palette, School, Sun, Moon, Monitor } from 'lucide-react'

export function SettingsClient({ user, profile = null }: any) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(profile?.profileImage || '')
  const [activeTab, setActiveTab] = useState('profile')

  const [profileForm, setProfileForm] = useState({
    firstName: profile?.firstName || '', lastName: profile?.lastName || '',
    email: user?.email || '', phone: profile?.phone || '',
    address: profile?.address || '', city: profile?.city || '', state: profile?.state || '',
  })

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const [appearance, setAppearance] = useState({ theme: theme || 'light', compactMode: false, fontSize: 'medium' })

  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsAlerts: false, attendanceUpdates: true,
    feeReminders: true, examAlerts: true, eventReminders: false,
  })

  useEffect(() => {
    fetch('/api/profile/photo').then(r => r.json()).then(d => { if (d.photoUrl) setPhotoUrl(d.photoUrl) }).catch(() => {})
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      try {
        const res = await fetch('/api/profile/photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo: base64 }) })
        const data = await res.json()
        if (data.success) { setPhotoUrl(data.url || base64); toast.success('Photo uploaded!') }
        else { toast.error(data.error || 'Failed') }
      } catch { toast.error('Upload failed') } finally { setUploading(false) }
    }
    reader.onerror = () => { setUploading(false) }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    setPhotoUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    try { await fetch('/api/profile/photo', { method: 'DELETE' }) } catch {}
    toast.success('Photo removed')
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      let endpoint = '', id = ''
      if (user?.role === 'teacher' && profile?.id) { endpoint = '/api/teachers/'; id = profile.id }
      else if (user?.role === 'student' && profile?.id) { endpoint = '/api/students/'; id = profile.id }
      if (endpoint && id) {
        const res = await fetch(endpoint + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profileForm, profileImage: photoUrl }) })
        if (res.ok) { toast.success('Profile updated!'); router.refresh() } else { toast.error('Failed') }
      } else { toast.success('Profile saved!') }
    } catch { toast.error('Error') } finally { setLoading(false) }
  }

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (passwordForm.newPassword.length < 6) { toast.error('Minimum 6 characters'); return }
    toast.success('Password changed!')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const getInitials = () => {
    if (profile?.firstName) return (profile.firstName[0] + (profile.lastName?.[0] || '')).toUpperCase()
    return user?.email?.substring(0, 2).toUpperCase() || 'U'
  }

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className='space-y-6'>
      <div><h1 className='text-3xl font-bold'>Settings</h1><p className='text-sm text-muted-foreground mt-1'>Manage your account</p></div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='profile'><User className='mr-2 h-4 w-4' />Profile</TabsTrigger>
          <TabsTrigger value='security'><Lock className='mr-2 h-4 w-4' />Security</TabsTrigger>
          <TabsTrigger value='notifications'><Bell className='mr-2 h-4 w-4' />Notifications</TabsTrigger>
          <TabsTrigger value='appearance'><Palette className='mr-2 h-4 w-4' />Appearance</TabsTrigger>
          <TabsTrigger value='school'><School className='mr-2 h-4 w-4' />School</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-6'>
          <Card>
            <CardHeader><CardTitle><Camera className='inline h-5 w-5 mr-2' />Profile Photo</CardTitle></CardHeader>
            <CardContent>
              <div className='flex items-center gap-6'>
                <Avatar className='h-24 w-24 border-2 shadow-lg'>
                  <AvatarImage src={photoUrl || undefined} className='object-cover' />
                  <AvatarFallback className='text-2xl bg-primary/10 font-bold'>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Uploading...</> : <><Upload className='mr-2 h-4 w-4' />Upload</>}
                    </Button>
                    {photoUrl && <Button variant='outline' size='sm' className='text-red-500' onClick={handleRemovePhoto}>Remove</Button>}
                  </div>
                  <input ref={fileInputRef} type='file' accept='image/*' onChange={handlePhotoUpload} className='hidden' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle><User className='inline h-5 w-5 mr-2' />Profile Info</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div><Label>First Name</Label><Input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} /></div>
                <div><Label>Last Name</Label><Input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} /></div>
                <div><Label>Email</Label><Input value={profileForm.email} disabled className='bg-muted' /></div>
                <div><Label>Phone</Label><Input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
              </div>
              <Badge variant='outline' className='capitalize'>{user?.role}</Badge>
              <Button onClick={handleSaveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security'>
          <Card>
            <CardHeader><CardTitle><Lock className='inline h-5 w-5 mr-2' />Change Password</CardTitle></CardHeader>
            <CardContent className='space-y-4 max-w-md'>
              <div><Label>Current Password</Label><Input type='password' value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} /></div>
              <div><Label>New Password</Label><Input type='password' value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} /></div>
              <div><Label>Confirm Password</Label><Input type='password' value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} /></div>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications'>
          <Card>
            <CardHeader><CardTitle><Bell className='inline h-5 w-5 mr-2' />Notifications</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              {[{ key: 'emailNotifications', label: 'Email Notifications' }, { key: 'attendanceUpdates', label: 'Attendance Updates' }, { key: 'feeReminders', label: 'Fee Reminders' }, { key: 'examAlerts', label: 'Exam Alerts' }].map(item => (
                <div key={item.key} className='flex items-center justify-between p-3 border rounded-lg'>
                  <span className='text-sm font-medium'>{item.label}</span>
                  <Switch checked={(notifications as any)[item.key]} onCheckedChange={(c) => setNotifications({...notifications, [item.key]: c})} />
                </div>
              ))}
              <Button onClick={() => toast.success('Saved!')}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='appearance'>
          <Card>
            <CardHeader><CardTitle><Palette className='inline h-5 w-5 mr-2' />Appearance</CardTitle></CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <Label>Theme</Label>
                <div className='grid grid-cols-3 gap-4 mt-2'>
                  {themeOptions.map((opt) => (
                    <div key={opt.value} onClick={() => { setAppearance({...appearance, theme: opt.value}); setTheme(opt.value) }}
                      className={`p-4 border-2 rounded-lg cursor-pointer text-center hover:border-primary ${appearance.theme === opt.value ? 'border-primary bg-primary/5' : ''}`}>
                      <opt.icon className='h-6 w-6 mx-auto mb-2' /><span className='text-sm font-medium'>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div><p className='font-medium'>Compact Mode</p></div>
                <Switch checked={appearance.compactMode} onCheckedChange={(c) => setAppearance({...appearance, compactMode: c})} />
              </div>
              <Button onClick={() => { setTheme(appearance.theme); toast.success('Appearance saved!') }}>Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='school'>
          <Card>
            <CardHeader><CardTitle><School className='inline h-5 w-5 mr-2' />School Info</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div><Label>Name</Label><Input value='Springfield International School' disabled className='bg-muted' /></div>
                <div><Label>Code</Label><Input value='SCH001' disabled className='bg-muted' /></div>
                <div><Label>Email</Label><Input value='info@springfield.edu' disabled className='bg-muted' /></div>
                <div><Label>Phone</Label><Input value='+1-555-0100' disabled className='bg-muted' /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
