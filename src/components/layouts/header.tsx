'use client'

// src/components/layouts/header.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/profile/photo')
      .then(res => res.json())
      .then(data => { if (data.photoUrl) setPhotoUrl(data.photoUrl) })
      .catch(() => {})
    
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getInitials = () => {
    const email = session?.user?.email || 'U'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className={cn(
      'sticky top-0 z-50 transition-all duration-200',
      scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b shadow-sm'
        : 'bg-white dark:bg-gray-900 border-b'
    )}>
      <div className='flex h-16 items-center px-4 gap-4'>
        {/* Mobile menu button */}
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='h-5 w-5' />
        </Button>

        {/* Search */}
        <div className='flex-1 max-w-xl'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input 
              placeholder='Search anything...' 
              className='pl-10 bg-slate-50 dark:bg-gray-800 border-0 focus-visible:ring-1 rounded-xl h-10'
            />
            <kbd className='absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded-lg border bg-white dark:bg-gray-700 px-1.5 py-0.5 text-xs text-slate-400'>
              <span>⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-1'>
          {/* Theme toggle */}
          {mounted && (
            <Button 
              variant='ghost' 
              size='icon' 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800'
            >
              {theme === 'dark' ? (
                <Sun className='h-5 w-5 text-yellow-500' />
              ) : (
                <Moon className='h-5 w-5 text-slate-600' />
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button 
            variant='ghost' 
            size='icon' 
            className='relative rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800'
          >
            <Bell className='h-5 w-5 text-slate-600 dark:text-slate-300' />
            <span className='absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900' />
          </Button>

          {/* User Avatar */}
          <div className='ml-2 pl-2 border-l'>
            <Avatar className='h-9 w-9 ring-2 ring-offset-2 ring-blue-500/20 ring-offset-white dark:ring-offset-gray-900'>
              <AvatarImage src={photoUrl || undefined} className='object-cover' />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold'>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  )
}