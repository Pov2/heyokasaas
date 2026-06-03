'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { OrderForm, OrderFormData } from './OrderForm'
import type { Order } from '@/types'

interface OrderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (order: Order) => void
  editOrder?: Order | null
}

export function OrderModal({ open, onClose, onSuccess, editOrder }: OrderModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (data: OrderFormData) => {
    setIsLoading(true)
    try {
      const url = editOrder ? `/api/orders/${editOrder.id}` : '/api/orders'
      const method = editOrder ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customerId,
          notes: data.notes,
          items: data.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      const order = await res.json()
      onSuccess(order)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {editOrder ? `Editar pedido #${editOrder.number}` : 'Nuevo pedido'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          <OrderForm
            initial={editOrder ?? undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
