'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { History } from 'lucide-react'
import { SessionStatus } from '@/components/cash/SessionStatus'
import { MovementForm } from '@/components/cash/MovementForm'
import { MovementTable } from '@/components/cash/MovementTable'
import { PaymentSummary } from '@/components/cash/PaymentSummary'
import type { CashSession, CashMovement } from '@/types'

interface SummaryData {
  currentSession: { id: string; openedAt: string; openingBalance: number; status: string } | null
  sessionStatus: 'OPEN' | 'NONE'
  totals: { cash: number; card: number; bizum: number; other: number }
  totalRevenue: number
  movementCount: number
}

export default function CajaContent() {
  const [session, setSession] = useState<CashSession | null>(null)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [sessionRes, summaryRes] = await Promise.all([
      fetch('/api/cash/session'),
      fetch('/api/cash/summary'),
    ])
    if (sessionRes.ok) {
      const data = await sessionRes.json()
      setSession(data)
    }
    if (summaryRes.ok) {
      setSummary(await summaryRes.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleSessionOpened(newSession: CashSession) {
    setSession(newSession)
    fetchData()
  }

  function handleSessionClosed(closedSession: CashSession) {
    setSession(null)
    fetchData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void closedSession
  }

  function handleMovementAdded(movement: CashMovement) {
    setSession(prev => {
      if (!prev) return prev
      return { ...prev, movements: [movement, ...prev.movements] }
    })
    fetchData()
  }

  if (loading) {
    return <div className="p-6 text-center text-slate-400">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caja / TPV</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona las sesiones de caja y cobros</p>
        </div>
        <Link
          href="/caja/historial"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          <History size={16} />
          Historial
        </Link>
      </div>

      {/* Top row: Session status + Payment summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SessionStatus
            session={session}
            onSessionOpened={handleSessionOpened}
            onSessionClosed={handleSessionClosed}
          />
        </div>
        <div className="lg:col-span-2">
          <PaymentSummary
            cash={summary?.totals.cash ?? 0}
            card={summary?.totals.card ?? 0}
            bizum={summary?.totals.bizum ?? 0}
            total={summary?.totalRevenue ?? 0}
          />
        </div>
      </div>

      {/* Movement form - only when session is open */}
      {session?.status === 'OPEN' && (
        <MovementForm
          sessionId={session.id}
          onMovementAdded={handleMovementAdded}
        />
      )}

      {/* Movements table */}
      {session ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Movimientos de la sesión actual</h2>
          </div>
          <MovementTable movements={session.movements} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-12 text-slate-400 text-sm">
          Abre una sesión de caja para ver los movimientos
        </div>
      )}
    </div>
  )
}
