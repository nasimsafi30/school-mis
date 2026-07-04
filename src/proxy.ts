import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAuthPage = nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = nextUrl.pathname === '/'

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
