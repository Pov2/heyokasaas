import { auth } from '@/lib/auth'
import { Users, ClipboardList, Package, UserCheck } from 'lucide-react'

const kpis = [
  {
    label: 'Total clientes',
    value: '0',
    description: 'Clientes registrados',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Pedidos hoy',
    value: '0',
    description: 'Pedidos del día',
    icon: ClipboardList,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Productos en stock',
    value: '0',
    description: 'Artículos disponibles',
    icon: Package,
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Empleados activos',
    value: '0',
    description: 'Personal en plantilla',
    icon: UserCheck,
    color: 'bg-purple-50 text-purple-600',
  },
]

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm capitalize">{today}</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Bienvenido, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Aquí tienes el resumen de{' '}
          <span className="font-medium text-slate-700">{user?.businessName ?? 'tu negocio'}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{kpi.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nuevo pedido', href: '/dashboard/pedidos/nuevo', color: 'bg-amber-500 hover:bg-amber-600' },
              { label: 'Añadir cliente', href: '/dashboard/clientes/nuevo', color: 'bg-slate-800 hover:bg-slate-900' },
              { label: 'Nuevo producto', href: '/dashboard/productos/nuevo', color: 'bg-slate-800 hover:bg-slate-900' },
              { label: 'Ver reservas', href: '/dashboard/reservas', color: 'bg-slate-800 hover:bg-slate-900' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`${action.color} text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors text-center`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Últimos pedidos</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No hay pedidos aún</p>
            <p className="text-slate-400 text-xs mt-1">Los pedidos aparecerán aquí</p>
          </div>
        </div>
      </div>
    </div>
  )
}
