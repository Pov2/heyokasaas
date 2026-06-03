'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
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

interface MobileSidebarProps {
  businessName: string
  businessType: string
  userName: string
  userEmail: string
  initials: string
  signOutAction: () => Promise<void>
}

export function MobileSidebar({ businessName, businessType, userName, userEmail, initials, signOutAction }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const isRestaurante = businessType === 'RESTAURANTE'

  return (
    <>
      {/* Top bar - mobile only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-white font-bold text-lg">HeyOka</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">HeyOka</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[140px]">{businessName}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
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
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-slate-500 text-xs truncate">{userEmail}</p>
            </div>
          </div>
          <form action={signOutAction}>
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
    </>
  )
}
