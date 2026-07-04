'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/classes', label: 'Classes' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/exams', label: 'Exams' },
  { href: '/fees', label: 'Fees' },
  { href: '/library', label: 'Library' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='h-5 w-5' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-64'>
        <div className='space-y-4 py-4'>
          <div className='px-3 py-2'>
            <h2 className='mb-2 px-4 text-lg font-semibold'>School MIS</h2>
            <div className='space-y-1'>
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent',
                    pathname === route.href ? 'bg-accent' : 'transparent'
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
