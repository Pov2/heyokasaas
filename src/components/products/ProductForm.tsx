'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Product, Category, Supplier } from '@/types'

interface ProductFormProps {
  initial?: Partial<Product>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface ProductFormData {
  name: string
  description: string
  price: string
  cost: string
  stock: string
  unit: string
  categoryId: string
  supplierId: string
  active: boolean
}

const UNITS = ['ud', 'kg', 'g', 'L', 'ml', 'ración', 'botella', 'caja']

export function ProductForm({ initial, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price !== undefined ? String(initial.price) : '',
    cost: initial?.cost !== undefined && initial.cost !== null ? String(initial.cost) : '',
    stock: initial?.stock !== undefined ? String(initial.stock) : '0',
    unit: initial?.unit ?? 'ud',
    categoryId: initial?.categoryId ?? '',
    supplierId: initial?.supplierId ?? '',
    active: initial?.active !== undefined ? initial.active : true,
  })
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
    fetch('/api/suppliers').then((r) => r.json()).then(setSuppliers).catch(() => {})
  }, [])

  const handleChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    if (!form.price || isNaN(Number(form.price))) {
      setError('El precio de venta es obligatorio')
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
          placeholder="Nombre del producto"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
        <textarea
          value={form.description}
          onChange={handleChange('description')}
          placeholder="Descripción opcional..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Precio de venta (€) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange('price')}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coste (€)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.cost}
            onChange={handleChange('cost')}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange('stock')}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <select
            value={form.unit}
            onChange={handleChange('unit')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            value={form.categoryId}
            onChange={handleChange('categoryId')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
          <select
            value={form.supplierId}
            onChange={handleChange('supplierId')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
        </label>
        <span className="text-sm font-medium text-slate-700">
          {form.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  )
}
