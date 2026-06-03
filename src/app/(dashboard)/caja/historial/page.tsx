import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Historial de caja — HeyOka' }

export default async function CajaHistorialPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) redirect('/login')

  const sessions = await prisma.cashSession.findMany({
    where: { businessId },
    include: { _count: { select: { movements: true } } },
    orderBy: { openedAt: 'desc' },
  })

  function fmt(date: Date | null | undefined) {
    if (!date) return '—'
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/caja" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de caja</h1>
          <p className="text-slate-500 text-sm mt-1">Sesiones de caja anteriores</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No hay sesiones de caja registradas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apertura</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cierre</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo apertura</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo cierre</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diferencia</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Movimientos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.map(s => {
                const diff = s.closingBalance != null
                  ? s.closingBalance - s.openingBalance
                  : null
                const diffClass = diff == null
                  ? 'text-slate-400'
                  : diff >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{fmt(s.openedAt)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {s.status === 'OPEN'
                        ? <span className="text-green-600 font-medium">Abierta</span>
                        : fmt(s.closedAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{s.openingBalance.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {s.closingBalance != null ? `${s.closingBalance.toFixed(2)} €` : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right ${diffClass}`}>
                      {diff != null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{s._count.movements}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/caja/historial/${s.id}`}
                        className="text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                      >
                        Ver <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
