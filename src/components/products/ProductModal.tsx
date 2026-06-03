'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ProductForm, ProductFormData } from './ProductForm'
import type { Product } from '@/types'

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
  editProduct?: Product | null
}

export function ProductModal({ open, onClose, onSuccess, editProduct }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          cost: data.cost,
          stock: data.stock,
          unit: data.unit,
          vatRate: data.vatRate,
          categoryId: data.categoryId,
          supplierId: data.supplierId,
          active: data.active,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      const product = await res.json()
      onSuccess(product)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {editProduct ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <ProductForm
            initial={editProduct ?? undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
