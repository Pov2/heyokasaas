import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/clientes',
  '/proveedores',
  '/carta',
  '/pedidos',
  '/stock',
  '/empleados',
  '/reservas',
  '/facturacion',
  '/caja',
  '/mesas',
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtected = PROTECTED_PATHS.some(p => nextUrl.pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clientes/:path*',
    '/proveedores/:path*',
    '/carta/:path*',
    '/pedidos/:path*',
    '/stock/:path*',
    '/empleados/:path*',
    '/reservas/:path*',
    '/facturacion/:path*',
    '/caja/:path*',
    '/mesas/:path*',
    '/login',
  ],
}
