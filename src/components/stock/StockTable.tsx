'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Product } from '@/types'

interface StockTableProps {
  products: Product[]
  onStockUpdated: (updated: Product) => void
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Sin stock</Badge>
  if (stock <= 5) return <Badge variant="destructive">Crítico</Badge>
  if (stock <= 10) return <Badge variant="warning">Bajo</Badge>
  return <Badge variant="success">OK</Badge>
}

function rowBg(stock: number) {
  if (stock === 0) return 'bg-red-50'
  if (stock <= 5) return 'bg-amber-50'
  return ''
}

function QuickAdjust({
  product,
  onUpdated,
}: {
  product: Product
  onUpdated: (p: Product) => void
}) {
  const [loading, setLoading] = useState(false)

  async function adjust(delta: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/stock/${product.id}/adjust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdated(updated)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={e => e.stopPropagation()}
    >
      <button
        disabled={loading || product.stock === 0}
        onClick={() => adjust(-1)}
        className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-10 text-center text-sm font-semibold text-slate-800">
        {product.stock}
      </span>
      <button
        disabled={loading}
        onClick={() => adjust(1)}
        className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}

export function StockTable({ products, onStockUpdated }: StockTableProps) {
  const router = useRouter()

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No hay productos que coincidan con los filtros
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Categoría</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Proveedor</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Stock actual</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Unidad</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Estado</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Ajuste rápido</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr
              key={product.id}
              onClick={() => router.push(`/carta/${product.id}`)}
              className={`border-b border-slate-100 last:border-0 cursor-pointer hover:brightness-95 transition-all ${rowBg(product.stock)}`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
              <td className="px-4 py-3 text-slate-500">
                {product.category?.name ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {product.supplier?.name ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center font-semibold text-slate-800">
                {product.stock}
              </td>
              <td className="px-4 py-3 text-center text-slate-500">{product.unit}</td>
              <td className="px-4 py-3 text-center">
                <StockBadge stock={product.stock} />
              </td>
              <td className="px-4 py-3 text-center">
                <QuickAdjust product={product} onUpdated={onStockUpdated} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
