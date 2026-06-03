'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left dark sidebar */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">HeyOka</span>
          </div>
          <p className="text-slate-400 text-sm ml-13 pl-1">Gestión HORECA inteligente</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-sm">✦</span>
              </div>
              <div>
                <p className="text-white font-medium">Control total de tu negocio</p>
                <p className="text-slate-400 text-sm">Gestiona pedidos, clientes y proveedores desde un solo lugar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-sm">✦</span>
              </div>
              <div>
                <p className="text-white font-medium">Reservas y sala en tiempo real</p>
                <p className="text-slate-400 text-sm">Gestión de mesas, reservas y turnos de forma eficiente.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-sm">✦</span>
              </div>
              <div>
                <p className="text-white font-medium">Informes y facturación</p>
                <p className="text-slate-400 text-sm">Analítica clara para tomar decisiones con datos reales.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2024 HeyOka. Todos los derechos reservados.</p>
      </div>

      {/* Right white form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <span className="text-slate-900 text-xl font-bold">HeyOka</span>
              <p className="text-slate-500 text-xs">Gestión HORECA inteligente</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h1>
            <p className="text-slate-500 mt-1">Accede a tu panel de gestión</p>
          </div>

          {registered && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              ¡Cuenta creada! Ya puedes iniciar sesión.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@restaurante.com"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Regístrate
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@heyoka.app" className="text-amber-600 hover:text-amber-700 font-medium">
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
