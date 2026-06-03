'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDeleted: (id: string) => void
}

function MarginBadge({ price, cost }: { price: number; cost?: number | null }) {
  if (cost === undefined || cost === null) return <span className="text-slate-400">—</span>
  const margin = ((price - cost) / price) * 100
  const colorClass =
    margin >= 60
      ? 'text-green-700 bg-green-50'
      : margin >= 30
      ? 'text-yellow-700 bg-yellow-50'
      : 'text-red-700 bg-red-50'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {margin.toFixed(1)}%
    </span>
  )
}

function StockDisplay({ stock }: { stock: number }) {
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold text-amber-600">{stock}</span>
        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
          bajo
        </span>
      </span>
    )
  }
  return <span className="text-slate-700">{stock}</span>
}

export function ProductTable({ products, onEdit, onDeleted }: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Error al eliminar')
        return
      }
      onDeleted(id)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay productos aún</p>
        <p className="text-slate-400 text-sm mt-1">
          Crea tu primer producto con el botón &quot;Nuevo producto&quot;
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Nombre</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Precio</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Coste</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Margen</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Stock</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Unidad</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/carta/${product.id}`}
                  className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
                >
                  {product.name}
                </Link>
                {product.description && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                    {product.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                {product.category ? (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">
                    {product.category.name}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                {product.price.toFixed(2)} €
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
                {product.cost !== null && product.cost !== undefined
                  ? `${product.cost.toFixed(2)} €`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <MarginBadge price={product.price} cost={product.cost} />
              </td>
              <td className="px-4 py-3 text-right">
                <StockDisplay stock={product.stock} />
              </td>
              <td className="px-4 py-3 text-slate-500">{product.unit}</td>
              <td className="px-4 py-3">
                {product.active ? (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {confirmId === product.id ? (
                    <>
                      <span className="text-xs text-slate-500 mr-1">¿Eliminar?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? '...' : 'Sí'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmId(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
