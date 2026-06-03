'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Supplier } from '@/types'

interface SupplierFormProps {
  initial?: Partial<Supplier>
  onSubmit: (data: SupplierFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface SupplierFormData {
  name: string
  email: string
  phone: string
  address: string
  category: string
  notes: string
}

const CATEGORY_SUGGESTIONS = [
  'Bebidas',
  'Carnes',
  'Pescados',
  'Frutas y Verduras',
  'Lácteos',
  'Panadería',
  'Limpieza',
  'Otros',
]

export function SupplierForm({ initial, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const [form, setForm] = useState<SupplierFormData>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    category: initial?.category ?? '',
    notes: initial?.notes ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof SupplierFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
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
          Nombre <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Nombre del proveedor"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="proveedor@email.com"
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
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
        <Input
          value={form.address}
          onChange={handleChange('address')}
          placeholder="Calle, número, ciudad..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
        <Input
          list="category-suggestions"
          value={form.category}
          onChange={handleChange('category')}
          placeholder="Ej: Bebidas, Carnes..."
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
        <textarea
          value={form.notes}
          onChange={handleChange('notes')}
          placeholder="Observaciones, condiciones de pago..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar proveedor'}
        </Button>
      </div>
    </form>
  )
}
