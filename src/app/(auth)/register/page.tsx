'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BUSINESS_TYPES = [
  { value: 'RESTAURANTE', label: 'Restaurante' },
  { value: 'BAR', label: 'Bar' },
  { value: 'TAKE_AWAY', label: 'Take Away' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'DARK_KITCHEN', label: 'Dark Kitchen' },
]

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  RESTAURANTE: 'Restaurante',
  BAR: 'Bar',
  TAKE_AWAY: 'Take Away',
  HOTEL: 'Hotel',
  CATERING: 'Catering',
  DARK_KITCHEN: 'Dark Kitchen',
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [city, setCity] = useState('')

  // Step 2 fields
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!businessName.trim() || !businessType) {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }
    setError('')
    setStep(2)
  }

  function goToStep3(e: React.FormEvent) {
    e.preventDefault()
    if (!ownerName.trim() || !email.trim() || !password) {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setStep(3)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessType, ownerName, email, password, city }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al crear la cuenta.')
        setLoading(false)
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition'

  return (
    <div className="min-h-screen flex">
      {/* Left dark panel */}
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

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Empieza a gestionar<br />tu negocio hoy mismo
          </h2>
          <p className="text-slate-400">
            Únete a cientos de negocios HORECA que ya confían en HeyOka para su gestión diaria.
          </p>
          <div className="space-y-4">
            {[
              'Registro gratuito, sin tarjeta de crédito',
              'Acceso inmediato a todas las funciones',
              'Soporte en español incluido',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    s < step
                      ? 'bg-amber-500 text-white'
                      : s === step
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`h-0.5 w-8 ${s < step ? 'bg-amber-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
            <span className="ml-2 text-sm text-slate-500">
              {step === 1 ? 'Tu negocio' : step === 2 ? 'Tu cuenta' : 'Confirmar'}
            </span>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={goToStep2} className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Tu negocio</h1>
                <p className="text-slate-500 mt-1">Cuéntanos sobre tu establecimiento</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre del negocio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: Restaurante Casa Juan"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tipo de negocio <span className="text-red-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Selecciona un tipo...</option>
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Madrid"
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={goToStep3} className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Tu cuenta</h1>
                <p className="text-slate-500 mt-1">Datos de acceso al panel</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej: Juan García"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@restaurante.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(1) }}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Continuar
                </button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Confirmar datos</h1>
                <p className="text-slate-500 mt-1">Revisa la información antes de crear tu cuenta</p>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tu negocio</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Nombre</span>
                      <span className="font-medium text-slate-900">{businessName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tipo</span>
                      <span className="font-medium text-slate-900">{BUSINESS_TYPE_LABELS[businessType] ?? businessType}</span>
                    </div>
                    {city && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ciudad</span>
                        <span className="font-medium text-slate-900">{city}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tu cuenta</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Nombre</span>
                      <span className="font-medium text-slate-900">{ownerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-900">{email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Rol</span>
                      <span className="font-medium text-slate-900">Propietario</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
