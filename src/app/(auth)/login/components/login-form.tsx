'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2, AlertCircle, School, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  useEffect(() => {
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password. Please try again.')
    } else if (errorParam === 'SessionRequired') {
      setError('Please sign in to access this page.')
    } else if (errorParam) {
      setError('An error occurred. Please try again.')
    }
  }, [errorParam])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@school.com', password: 'admin123' },
      teacher: { email: 'teacher@school.com', password: 'teacher123' },
      student: { email: 'student@school.com', password: 'student123' },
    }

    const cred = credentials[role]
    if (cred) {
      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement
      if (emailInput) emailInput.value = cred.email
      if (passwordInput) passwordInput.value = cred.password
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto shadow-xl border-0'>
      <CardHeader className='space-y-1 text-center'>
        <div className='flex justify-center mb-4'>
          <div className='p-3 bg-primary/10 rounded-full'>
            <School className='h-8 w-8 text-primary' />
          </div>
        </div>
        <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
        <CardDescription>Sign in to your School MIS account</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive' className='animate-in slide-in-from-top-2'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-sm font-medium'>
              Email Address
            </Label>
            <div className='relative'>
              <Input
                id='email'
                type='email'
                placeholder='admin@school.com'
                {...register('email')}
                className={cn(
                  'pl-10',
                  errors.email && 'border-red-500 focus-visible:ring-red-500'
                )}
                disabled={isLoading}
                autoComplete='email'
                autoFocus
              />
              <svg
                className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
            </div>
            {errors.email && (
              <p className='text-sm text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <Link
                href='/forgot-password'
                className='text-xs text-primary hover:underline'
              >
                Forgot password?
              </Link>
            </div>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                {...register('password')}
                className={cn(
                  'pl-10 pr-10',
                  errors.password && 'border-red-500 focus-visible:ring-red-500'
                )}
                disabled={isLoading}
                autoComplete='current-password'
              />
              <svg
                className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors'
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='text-sm text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox id='rememberMe' {...register('rememberMe')} />
            <Label
              htmlFor='rememberMe'
              className='text-sm font-normal cursor-pointer'
            >
              Remember me for 30 days
            </Label>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading}
            size='lg'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
          <p className='text-xs font-medium text-center text-muted-foreground'>
            Demo Credentials
          </p>
          <div className='grid grid-cols-3 gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fillDemoCredentials('admin')}
              className='text-xs h-auto py-2'
            >
              <div className='text-center'>
                <p className='font-medium'>Admin</p>
                <p className='text-[10px] text-muted-foreground'>Full Access</p>
              </div>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fillDemoCredentials('teacher')}
              className='text-xs h-auto py-2'
            >
              <div className='text-center'>
                <p className='font-medium'>Teacher</p>
                <p className='text-[10px] text-muted-foreground'>Staff Access</p>
              </div>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fillDemoCredentials('student')}
              className='text-xs h-auto py-2'
            >
              <div className='text-center'>
                <p className='font-medium'>Student</p>
                <p className='text-[10px] text-muted-foreground'>Limited Access</p>
              </div>
            </Button>
          </div>
          <div className='text-[10px] text-center text-muted-foreground space-y-1'>
            <p>Admin: admin@school.com / admin123</p>
            <p>Teacher: teacher@school.com / teacher123</p>
            <p>Student: student@school.com / student123</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex flex-col space-y-4'>
        <div className='text-sm text-center text-muted-foreground'>
          Don't have an account?{' '}
          <Link href='/register' className='text-primary hover:underline font-medium'>
            Create one
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}