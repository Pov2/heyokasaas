import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Users, ClipboardList, Package, UserCheck, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `hace ${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `hace ${diffDays}d`
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'En curso',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  READY: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any
  const businessId: string = user?.businessId

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

  const [
    totalCustomers,
    ordersToday,
    activeOrders,
    lowStockProducts,
    criticalStockProducts,
    activeEmployees,
    revenueResult,
    recentOrders,
  ] = await Promise.all([
    prisma.customer.count({ where: { businessId } }),
    prisma.order.count({
      where: { businessId, createdAt: { gte: todayStart } },
    }),
    prisma.order.count({
      where: {
        businessId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    }),
    prisma.product.count({
      where: { businessId, stock: { lte: 10 }, active: true },
    }),
    prisma.product.count({
      where: { businessId, stock: { lte: 5 }, active: true },
    }),
    prisma.employee.count({ where: { businessId, active: true } }),
    prisma.order.aggregate({
      where: {
        businessId,
        status: 'DELIVERED',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
  ])

  const revenue = revenueResult._sum.total ?? 0

  const todayFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const kpis = [
    {
      label: 'Clientes totales',
      value: totalCustomers.toString(),
      description: 'Clientes registrados',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pedidos hoy',
      value: ordersToday.toString(),
      description: 'Pedidos del día',
      icon: ClipboardList,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Pedidos activos',
      value: activeOrders.toString(),
      description: 'Pendientes/en curso',
      icon: Clock,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Stock bajo',
      value: lowStockProducts.toString(),
      description: 'Productos con stock ≤ 10',
      icon: Package,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Empleados activos',
      value: activeEmployees.toString(),
      description: 'Personal en plantilla',
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Ingresos este mes',
      value: `${revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
      description: 'Pedidos entregados',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm capitalize">{todayFormatted}</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Bienvenido, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Aquí tienes el resumen de{' '}
          <span className="font-medium text-slate-700">{user?.businessName ?? 'tu negocio'}</span>
        </p>
      </div>

      {/* Critical stock alert */}
      {criticalStockProducts > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-medium">
            {criticalStockProducts} producto{criticalStockProducts > 1 ? 's' : ''} con stock crítico (≤ 5 unidades)
          </p>
          <Link href="/dashboard/productos" className="ml-auto text-sm text-amber-600 hover:underline font-medium">
            Ver productos
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
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

      {/* Quick actions + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nuevo pedido', href: '/pedidos', color: 'bg-amber-500 hover:bg-amber-600' },
              { label: 'Nueva reserva', href: '/reservas', color: 'bg-slate-800 hover:bg-slate-900' },
              { label: 'Nuevo cliente', href: '/clientes', color: 'bg-slate-800 hover:bg-slate-900' },
              { label: 'Ver productos', href: '/dashboard/productos', color: 'bg-slate-800 hover:bg-slate-900' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors text-center`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Últimos pedidos</h2>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No hay pedidos aún</p>
              <p className="text-slate-400 text-xs mt-1">Los pedidos aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Hace</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 text-slate-500 font-mono">#{order.number}</td>
                      <td className="py-2 text-slate-700 font-medium">
                        {order.customer?.name ?? 'Sin cliente'}
                      </td>
                      <td className="py-2 text-slate-700">
                        {order.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="py-2 text-slate-400 text-xs">{timeAgo(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
