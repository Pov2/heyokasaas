'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Product, Customer, Order } from '@/types'

export type OrderFormData = {
  customerId?: string
  notes?: string
  items: { productId: string; quantity: number; price: number; productName: string; unit: string }[]
}

interface OrderFormProps {
  initial?: Order
  onSubmit: (data: OrderFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function OrderForm({ initial, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState(initial?.customerId ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [items, setItems] = useState<{ productId: string; quantity: number; price: number; productName: string; unit: string }[]>(
    initial?.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
      productName: i.product.name,
      unit: i.product.unit,
    })) ?? []
  )
  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [customerSearch, setCustomerSearch] = useState(initial?.customer?.name ?? '')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => {})
    fetch('/api/products?active=true').then(r => r.json()).then(setProducts).catch(() => {})
  }, [])

  const filteredCustomers = customers.filter(c =>
    !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const addItem = () => {
    if (!selectedProduct) return
    const existing = items.find(i => i.productId === selectedProductId)
    if (existing) {
      setItems(items.map(i => i.productId === selectedProductId ? { ...i, quantity: i.quantity + qty } : i))
    } else {
      setItems([...items, {
        productId: selectedProduct.id,
        quantity: qty,
        price: selectedProduct.price,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
      }])
    }
    setSelectedProductId('')
    setQty(1)
  }

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId))
  }

  const total = items.reduce((acc, i) => acc + i.quantity * i.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('Añade al menos un artículo al pedido')
      return
    }
    try {
      await onSubmit({ customerId: customerId || undefined, notes, items })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Cliente <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <Input
          placeholder="Buscar cliente..."
          value={customerSearch}
          onChange={e => { setCustomerSearch(e.target.value); setCustomerId('') }}
          className="mb-1"
        />
        {customerSearch && !customerId && filteredCustomers.length > 0 && (
          <div className="border border-slate-200 rounded-lg divide-y max-h-40 overflow-y-auto">
            {filteredCustomers.slice(0, 6).map(c => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 transition-colors"
                onClick={() => { setCustomerId(c.id); setCustomerSearch(c.name) }}
              >
                {c.name}
                {c.phone && <span className="text-slate-400 ml-2">{c.phone}</span>}
              </button>
            ))}
          </div>
        )}
        {customerId && (
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-600 mt-1"
            onClick={() => { setCustomerId(''); setCustomerSearch('') }}
          >
            Quitar cliente
          </button>
        )}
      </div>

      {/* Items */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Artículos</label>
        <div className="flex gap-2 mb-3">
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Selecciona producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price.toFixed(2)} €
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Button type="button" onClick={addItem} disabled={!selectedProductId} variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Producto</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Cant.</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">P. unit.</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productId} className="border-t border-slate-100">
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-3 py-2 text-right">{item.price.toFixed(2)} €</td>
                    <td className="px-3 py-2 text-right font-semibold">{(item.quantity * item.price).toFixed(2)} €</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={3} className="px-3 py-2 text-right font-semibold text-slate-700">Total</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">{total.toFixed(2)} €</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-slate-200 rounded-lg">
            Sin artículos. Añade productos arriba.
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas del pedido..."
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear pedido'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
