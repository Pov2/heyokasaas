import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MovementTable } from '@/components/cash/MovementTable'
import { Badge } from '@/components/ui/Badge'
import type { CashMovement } from '@/types'

export const metadata = { title: 'Detalle de sesión — HeyOka' }

export default async function CajaSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) redirect('/login')

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) redirect('/login')

  const cashSession = await prisma.cashSession.findFirst({
    where: { id, businessId },
    include: { movements: { orderBy: { createdAt: 'desc' } } },
  })

  if (!cashSession) notFound()

  function fmt(date: Date | null | undefined) {
    if (!date) return '—'
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const diff = cashSession.closingBalance != null
    ? cashSession.closingBalance - cashSession.openingBalance
    : null

  // Map to CashMovement type (amount is Float in Prisma, which is number in JS)
  const movements: CashMovement[] = cashSession.movements.map(m => ({
    id: m.id,
    type: m.type as CashMovement['type'],
    amount: m.amount,
    paymentMethod: m.paymentMethod as CashMovement['paymentMethod'],
    description: m.description,
    orderId: m.orderId,
    sessionId: m.sessionId,
    createdAt: m.createdAt,
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/caja/historial" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sesión de caja</h1>
          <p className="text-slate-500 text-sm mt-1">{fmt(cashSession.openedAt)}</p>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Estado</p>
          <Badge variant={cashSession.status === 'OPEN' ? 'success' : 'default'}>
            {cashSession.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Apertura</p>
          <p className="text-sm font-semibold text-slate-900">{fmt(cashSession.openedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Cierre</p>
          <p className="text-sm font-semibold text-slate-900">{fmt(cashSession.closedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Saldo apertura</p>
          <p className="text-sm font-semibold text-slate-900">{cashSession.openingBalance.toFixed(2)} €</p>
        </div>
        {cashSession.closingBalance != null && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Saldo cierre</p>
            <p className="text-sm font-semibold text-slate-900">{cashSession.closingBalance.toFixed(2)} €</p>
          </div>
        )}
        {diff != null && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Diferencia</p>
            <p className={`text-sm font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {diff >= 0 ? '+' : ''}{diff.toFixed(2)} €
            </p>
          </div>
        )}
        {cashSession.notes && (
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-slate-500 mb-1">Notas</p>
            <p className="text-sm text-slate-700">{cashSession.notes}</p>
          </div>
        )}
      </div>

      {/* Movements */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Movimientos ({movements.length})</h2>
        </div>
        <MovementTable movements={movements} />
      </div>
    </div>
  )
}
