import { Badge } from '@/components/ui/Badge'
import type { CashMovement } from '@/types'

interface MovementTableProps {
  movements: CashMovement[]
}

const TYPE_LABELS: Record<string, string> = {
  SALE: 'Venta',
  REFUND: 'Devolución',
  IN: 'Entrada',
  OUT: 'Salida',
}

const TYPE_VARIANTS: Record<string, 'success' | 'destructive' | 'default' | 'warning'> = {
  SALE: 'success',
  REFUND: 'destructive',
  IN: 'success',
  OUT: 'destructive',
}

const METHOD_CLASSES: Record<string, string> = {
  CASH: 'bg-green-100 text-green-700',
  CARD: 'bg-blue-100 text-blue-700',
  BIZUM: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-slate-100 text-slate-700',
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  BIZUM: 'Bizum',
  OTHER: 'Otro',
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function MovementTable({ movements }: MovementTableProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No hay movimientos en esta sesión
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hora</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Método</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {movements.map(m => {
            const isPositive = m.type === 'IN' || m.type === 'SALE'
            const description = m.type === 'SALE' && m.orderId
              ? `Venta #${m.orderId.slice(-6)}`
              : (m.description ?? '—')
            return (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500">{formatTime(m.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={TYPE_VARIANTS[m.type] ?? 'default'}>
                    {TYPE_LABELS[m.type] ?? m.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${METHOD_CLASSES[m.paymentMethod] ?? METHOD_CLASSES.OTHER}`}>
                    {METHOD_LABELS[m.paymentMethod] ?? m.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{description}</td>
                <td className={`px-4 py-3 text-right font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : '-'}{m.amount.toFixed(2)} €
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
