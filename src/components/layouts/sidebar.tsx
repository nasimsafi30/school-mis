'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarDays, ClipboardCheck, DollarSign,
  Clock, Calendar, Library, Bus, Building2,
  Banknote, BarChart3, Settings, Bell, School,
  User, HelpCircle, FileText, LogOut,
} from 'lucide-react'

const mainRoutes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'from-blue-500 to-cyan-500' },
  { label: 'Students', icon: Users, href: '/students', color: 'from-violet-500 to-purple-500' },
  { label: 'Teachers', icon: GraduationCap, href: '/teachers', color: 'from-pink-500 to-rose-500' },
  { label: 'Classes', icon: BookOpen, href: '/classes', color: 'from-orange-500 to-amber-500' },
  { label: 'Attendance', icon: ClipboardCheck, href: '/attendance', color: 'from-emerald-500 to-green-500' },
  { label: 'Exams', icon: CalendarDays, href: '/exams', color: 'from-red-500 to-pink-500' },
  { label: 'Results', icon: BarChart3, href: '/results', color: 'from-yellow-500 to-orange-500' },
  { label: 'Fees', icon: DollarSign, href: '/fees', color: 'from-teal-500 to-cyan-500' },
  { label: 'Timetable', icon: Clock, href: '/timetable', color: 'from-indigo-500 to-blue-500' },
  { label: 'Events', icon: Calendar, href: '/events', color: 'from-fuchsia-500 to-pink-500' },
]

const managementRoutes = [
  { label: 'Library', icon: Library, href: '/library', color: 'from-amber-500 to-yellow-500' },
  { label: 'Transport', icon: Bus, href: '/transport', color: 'from-sky-500 to-blue-500' },
  { label: 'Hostel', icon: Building2, href: '/hostel', color: 'from-rose-500 to-red-500' },
  { label: 'Payroll', icon: Banknote, href: '/payroll', color: 'from-lime-500 to-green-500' },
  { label: 'Reports', icon: FileText, href: '/reports', color: 'from-cyan-500 to-teal-500' },
]

const otherRoutes = [
  { label: 'Notifications', icon: Bell, href: '/notifications', color: 'from-gray-500 to-slate-500' },
  { label: 'Settings', icon: Settings, href: '/settings', color: 'from-blue-400 to-indigo-400' },
  { label: 'Profile', icon: User, href: '/profile', color: 'from-sky-400 to-blue-400' },
  { label: 'Help & Support', icon: HelpCircle, href: '/help', color: 'from-green-400 to-emerald-400' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile/photo')
      .then(r => r.json())
      .then(d => { if (d.photoUrl) setPhotoUrl(d.photoUrl) })
      .catch(() => {})
  }, [])

  return (
    <div className='flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white'>
      {/* Logo Section */}
      <div className='px-4 py-6 border-b border-white/10'>
        <Link href='/dashboard' className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20'>
            <School className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent'>School MIS</h1>
            <p className='text-xs text-slate-400'>Management System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className='flex-1 px-3 py-4'>
        {/* Main Routes */}
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2'>Main</p>
        <div className='space-y-1 mb-4'>
          {mainRoutes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <div className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b',
                    route.color
                  )} />
                )}
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'
                )}>
                  <route.icon className='h-4 w-4' />
                </div>
                <span className='flex-1'>{route.label}</span>
              </Link>
            )
          })}
        </div>

        <Separator className='bg-white/10 my-2' />

        {/* Management Routes */}
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-4'>Management</p>
        <div className='space-y-1 mb-4'>
          {managementRoutes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'
                )}>
                  <route.icon className='h-4 w-4' />
                </div>
                <span className='flex-1'>{route.label}</span>
              </Link>
            )
          })}
        </div>

        <Separator className='bg-white/10 my-2' />

        {/* Other Routes */}
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-4'>Other</p>
        <div className='space-y-1'>
          {otherRoutes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'
                )}>
                  <route.icon className='h-4 w-4' />
                </div>
                <span className='flex-1'>{route.label}</span>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className='p-4 border-t border-white/10'>
        <Link href='/profile' className='flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'>
          {photoUrl ? (
            <img src={photoUrl} alt='Profile' className='h-8 w-8 rounded-full object-cover' />
          ) : (
            <div className='h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold'>A</div>
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>Admin User</p>
            <p className='text-xs text-slate-400 truncate'>admin@school.com</p>
          </div>
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='flex items-center gap-2 px-3 py-2 mt-2 text-xs text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 w-full text-left'
        >
          <LogOut className='h-3 w-3' /> Sign Out
        </button>
      </div>
    </div>
  )
}