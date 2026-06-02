import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isDashboard = nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
