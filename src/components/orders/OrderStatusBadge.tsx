import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'En preparación', className: 'bg-amber-100 text-amber-700' },
  READY: { label: 'Listo', className: 'bg-green-100 text-green-700' },
  DELIVERED: { label: 'Entregado', className: 'bg-slate-100 text-slate-600' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
