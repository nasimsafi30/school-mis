'use client'

import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut } from 'lucide-react'

export function UserMenu() {
  const { data: session } = useSession()
  const initials = session?.user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium'>{session?.user?.email}</p>
            <p className='text-xs text-muted-foreground capitalize'>{session?.user?.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
          <User className='mr-2 h-4 w-4' /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
          <Settings className='mr-2 h-4 w-4' /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className='text-red-600'>
          <LogOut className='mr-2 h-4 w-4' /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
