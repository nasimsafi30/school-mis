import { Suspense } from 'react'
import { LoginForm } from './components/login-form'
import { Loader2, School, Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 p-4'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl' />
      </div>

      <div className='w-full max-w-md relative z-10'>
        {/* Logo Section */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4'>
            <School className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
            School MIS
          </h1>
          <p className='text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1'>
            <Sparkles className='h-3 w-3 text-blue-500' />
            Management Information System
            <Sparkles className='h-3 w-3 text-blue-500' />
          </p>
        </div>

        {/* Login Form */}
        <Suspense fallback={
          <div className='flex items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
          </div>
        }>
          <LoginForm />
        </Suspense>
        
        {/* Footer */}
        <div className='mt-8 text-center space-y-2'>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} School MIS. All rights reserved.
          </p>
          <div className='flex justify-center gap-6 text-xs text-muted-foreground'>
            <a href='/terms' className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>Terms</a>
            <a href='/privacy' className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>Privacy</a>
            <a href='/help' className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>Help</a>
            <a href='/contact' className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>Contact</a>
          </div>
        </div>
      </div>
    </div>
  )
}