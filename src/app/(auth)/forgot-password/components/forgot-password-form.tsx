'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Check, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSuccess(
          'If an account with that email exists, we have sent password reset instructions.'
        )
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto shadow-xl border-0'>
      <CardHeader className='space-y-1 text-center'>
        <div className='flex justify-center mb-4'>
          <div className='p-3 bg-primary/10 rounded-full'>
            <Mail className='h-8 w-8 text-primary' />
          </div>
        </div>
        <CardTitle className='text-2xl font-bold'>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className='border-green-500 text-green-700 bg-green-50'>
            <Check className='h-4 w-4' />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                placeholder='your@email.com'
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href='/login'
          className='text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}
