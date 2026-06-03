'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Reservation } from '@/types'

interface ReservationFormProps {
  initial?: Partial<Reservation>
  onSubmit: (data: ReservationFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface ReservationFormData {
  name: string
  phone: string
  date: string
  partySize: string
  notes: string
  confirmed: boolean
}

function toDatetimeLocal(value: Date | string | undefined | null): string {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ReservationForm({ initial, onSubmit, onCancel, isLoading }: ReservationFormProps) {
  const [form, setForm] = useState<ReservationFormData>({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    date: toDatetimeLocal(initial?.date),
    partySize: initial?.partySize != null ? String(initial.partySize) : '',
    notes: initial?.notes ?? '',
    confirmed: initial?.confirmed ?? false,
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof Omit<ReservationFormData, 'confirmed'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (error) setError(null)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre del cliente es obligatorio')
      return
    }
    if (!form.date) {
      setError('La fecha y hora son obligatorias')
      return
    }
    const ps = Number(form.partySize)
    if (!form.partySize || isNaN(ps) || ps < 1) {
      setError('El número de comensales debe ser al menos 1')
      return
    }
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del cliente <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Nombre del cliente"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <Input
          type="tel"
          value={form.phone}
          onChange={handleChange('phone')}
          placeholder="+34 600 000 000"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={handleChange('date')}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número de comensales <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            value={form.partySize}
            onChange={handleChange('partySize')}
            placeholder="2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
        <textarea
          value={form.notes}
          onChange={handleChange('notes')}
          placeholder="Alergias, preferencias, ocasión especial..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.confirmed}
          onClick={() => setForm((prev) => ({ ...prev, confirmed: !prev.confirmed }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
            form.confirmed ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.confirmed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <label className="text-sm font-medium text-slate-700">
          {form.confirmed ? 'Confirmada' : 'Pendiente de confirmar'}
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar reserva'}
        </Button>
      </div>
    </form>
  )
}
