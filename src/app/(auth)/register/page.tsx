import { RegisterForm } from './components/register-form'

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <div className='w-full max-w-lg'>
        <RegisterForm />
        
        <div className='mt-8 text-center space-y-2'>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} School MIS. All rights reserved.
          </p>
          <div className='flex justify-center gap-4 text-xs text-muted-foreground'>
            <a href='/terms' className='hover:underline'>Terms</a>
            <a href='/privacy' className='hover:underline'>Privacy</a>
            <a href='/help' className='hover:underline'>Help</a>
            <a href='/contact' className='hover:underline'>Contact</a>
          </div>
        </div>
      </div>
    </div>
  )
}
