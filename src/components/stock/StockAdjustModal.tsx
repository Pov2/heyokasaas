'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Product } from '@/types'

const REASON_OPTIONS = [
  { value: 'entrada', label: 'Entrada mercancía' },
  { value: 'merma', label: 'Merma' },
  { value: 'ajuste', label: 'Ajuste inventario' },
  { value: 'uso_interno', label: 'Uso interno' },
  { value: 'correccion', label: 'Corrección' },
]

interface StockAdjustModalProps {
  product: Product
  onClose: () => void
  onSuccess: (updated: Product) => void
}

export function StockAdjustModal({ product, onClose, onSuccess }: StockAdjustModalProps) {
  const [delta, setDelta] = useState<string>('')
  const [reason, setReason] = useState(REASON_OPTIONS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deltaNum = Number(delta)
  const newStock = product.stock + (isNaN(deltaNum) ? 0 : deltaNum)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!delta || isNaN(deltaNum)) {
      setError('Introduce un número válido')
      return
    }
    if (newStock < 0) {
      setError('El stock resultante no puede ser negativo')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stock/${product.id}/adjust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: deltaNum, reason }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al ajustar stock')
        return
      }
      const updated = await res.json()
      onSuccess(updated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 mb-1">Ajustar stock</h2>
        <p className="text-sm text-slate-500 mb-4">{product.name}</p>

        <div className="flex gap-4 mb-5">
          <div className="bg-slate-50 rounded-lg p-3 flex-1 text-center">
            <p className="text-xs text-slate-500 mb-1">Stock actual</p>
            <p className="text-2xl font-bold text-slate-900">{product.stock}</p>
            <p className="text-xs text-slate-400">{product.unit}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 flex-1 text-center">
            <p className="text-xs text-slate-500 mb-1">Stock resultante</p>
            <p className={`text-2xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {newStock}
            </p>
            <p className="text-xs text-slate-400">{product.unit}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Delta (positivo = entrada, negativo = salida)
            </label>
            <Input
              type="number"
              placeholder="Ej: 10 o -5"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {REASON_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !delta} className="flex-1">
              {loading ? 'Guardando...' : 'Confirmar ajuste'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
