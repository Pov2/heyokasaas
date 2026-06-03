'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Employee } from '@/types'

interface EmployeeFormProps {
  initial?: Partial<Employee>
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface EmployeeFormData {
  name: string
  email: string
  phone: string
  position: string
  salary: string
  active: boolean
}

const POSITION_SUGGESTIONS = [
  'Camarero/a',
  'Cocinero/a',
  'Jefe de cocina',
  'Ayudante de cocina',
  'Barman',
  'Recepcionista',
  'Gerente',
  'Limpieza',
  'Repartidor/a',
  'Otros',
]

export function EmployeeForm({ initial, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    position: initial?.position ?? '',
    salary: initial?.salary != null ? String(initial.salary) : '',
    active: initial?.active !== undefined ? initial.active : true,
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof Omit<EmployeeFormData, 'active'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
          placeholder="Nombre del empleado"
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
            placeholder="empleado@email.com"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Puesto</label>
          <input
            list="position-suggestions"
            value={form.position}
            onChange={handleChange('position')}
            placeholder="Ej. Camarero/a"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
          <datalist id="position-suggestions">
            {POSITION_SUGGESTIONS.map((pos) => (
              <option key={pos} value={pos} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Salario (€/mes)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.salary}
            onChange={handleChange('salary')}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.active}
          onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
            form.active ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <label className="text-sm font-medium text-slate-700">
          {form.active ? 'Activo' : 'Inactivo'}
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar empleado'}
        </Button>
      </div>
    </form>
  )
}
