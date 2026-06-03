'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CashSession } from '@/types'

interface SessionStatusProps {
  session: CashSession | null
  onSessionOpened: (session: CashSession) => void
  onSessionClosed: (session: CashSession) => void
}

function formatTime(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function getTimeOpen(openedAt: Date | string) {
  const diff = Date.now() - new Date(openedAt).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function SessionStatus({ session, onSessionOpened, onSessionClosed }: SessionStatusProps) {
  const [openingBalance, setOpeningBalance] = useState('0')
  const [closingBalance, setClosingBalance] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleOpen() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/cash/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openingBalance: Number(openingBalance) }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    onSessionOpened(data)
  }

  async function handleClose() {
    if (!session) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/cash/session/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closingBalance: Number(closingBalance), notes: closingNotes }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    setShowCloseForm(false)
    onSessionClosed(data)
  }

  if (session?.status === 'OPEN') {
    return (
      <div className="bg-white rounded-xl border border-green-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Badge variant="success">Caja abierta</Badge>
          </div>
          <span className="text-xs text-slate-400">Desde {formatTime(session.openedAt)} · {getTimeOpen(session.openedAt)} abierta</span>
        </div>
        <div className="text-sm text-slate-600 mb-4">
          Saldo inicial: <span className="font-semibold text-slate-900">{session.openingBalance.toFixed(2)} €</span>
        </div>
        {!showCloseForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowCloseForm(true)}>
            Cerrar caja
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Saldo de cierre (€)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={closingBalance}
                onChange={e => setClosingBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Notas</label>
              <Input
                value={closingNotes}
                onChange={e => setClosingNotes(e.target.value)}
                placeholder="Notas de cierre..."
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleClose} disabled={loading}>
                {loading ? 'Cerrando...' : 'Confirmar cierre'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCloseForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <Badge variant="default">Caja cerrada</Badge>
      </div>
      <p className="text-sm text-slate-500 mb-4">No hay ninguna sesión de caja abierta</p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Saldo inicial (€)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={openingBalance}
            onChange={e => setOpeningBalance(e.target.value)}
            placeholder="0.00"
            className="max-w-[180px]"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button size="sm" onClick={handleOpen} disabled={loading}>
          {loading ? 'Abriendo...' : 'Abrir caja'}
        </Button>
      </div>
    </div>
  )
}
