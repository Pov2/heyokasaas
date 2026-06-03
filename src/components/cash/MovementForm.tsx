'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CashMovement } from '@/types'

interface MovementFormProps {
  sessionId: string
  onMovementAdded: (movement: CashMovement) => void
}

export function MovementForm({ sessionId, onMovementAdded }: MovementFormProps) {
  const [type, setType] = useState<'IN' | 'OUT'>('IN')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BIZUM'>('CASH')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Introduce un importe válido')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/cash/session/${sessionId}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount: Number(amount), paymentMethod, description }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    onMovementAdded(data)
    setAmount('')
    setDescription('')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Añadir movimiento manual</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="type"
              value="IN"
              checked={type === 'IN'}
              onChange={() => setType('IN')}
              className="accent-green-500"
            />
            <span className="text-green-700 font-medium">Entrada</span>
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="type"
              value="OUT"
              checked={type === 'OUT'}
              onChange={() => setType('OUT')}
              className="accent-red-500"
            />
            <span className="text-red-700 font-medium">Salida</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Importe (€) *</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'BIZUM')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="BIZUM">Bizum</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Descripción</label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Motivo del movimiento..."
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Guardando...' : 'Añadir movimiento'}
        </Button>
      </form>
    </div>
  )
}
