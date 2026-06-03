import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Truck,
  UtensilsCrossed,
  ClipboardList,
  Landmark,
  Package,
  UserCheck,
  CalendarDays,
  LayoutGrid,
  Receipt,
  LogOut,
} from 'lucide-react'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/proveedores', label: 'Proveedores', icon: Truck },
  { href: '/dashboard/productos', label: 'Carta / Productos', icon: UtensilsCrossed },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/caja', label: 'Caja / TPV', icon: Landmark },
  { href: '/dashboard/stock', label: 'Stock', icon: Package },
  { href: '/dashboard/empleados', label: 'Empleados', icon: UserCheck },
  { href: '/dashboard/reservas', label: 'Reservas', icon: CalendarDays, restauranteOnly: true },
  { href: '/dashboard/mesas', label: 'Mesas', icon: LayoutGrid, restauranteOnly: true },
  { href: '/dashboard/facturacion', label: 'Facturación', icon: Receipt },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const isRestaurante = user.businessType === 'RESTAURANTE'
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U'

  const signOutAction = async () => {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile sidebar */}
      <MobileSidebar
        businessName={user.businessName ?? 'Mi negocio'}
        businessType={user.businessType ?? ''}
        userName={user.name ?? 'Usuario'}
        userEmail={user.email ?? ''}
        initials={initials}
        signOutAction={signOutAction}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 flex-col shrink-0 min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">HeyOka</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[140px]">
                {user.businessName ?? 'Mi negocio'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.restauranteOnly && !isRestaurante) return null
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name ?? 'Usuario'}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
