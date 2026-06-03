'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, Package, Tag, Truck, TrendingUp, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductModal } from '@/components/products/ProductModal'
import type { Product } from '@/types'

type OrderItem = {
  id: string
  quantity: number
  price: number
  order: { id: string; number: number; status: string; createdAt: string }
}

type ProductWithOrders = Product & {
  category?: { id: string; name: string } | null
  supplier?: { id: string; name: string } | null
  orderItems: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'En curso',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default function ProductDetailClient({ product: initial }: { product: ProductWithOrders }) {
  const [product, setProduct] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [adjusting, setAdjusting] = useState(false)

  const margin = product.cost != null && product.price > 0
    ? ((product.price - product.cost) / product.price * 100).toFixed(1)
    : null

  async function adjustStock(delta: number) {
    setAdjusting(true)
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: product.stock + delta }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProduct(prev => ({ ...prev, stock: updated.stock }))
    }
    setAdjusting(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/carta">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          {product.description && <p className="text-slate-500 text-sm mt-1">{product.description}</p>}
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Pencil className="w-4 h-4" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info card */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Información del producto</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow icon={<Tag className="w-4 h-4" />} label="Categoría" value={product.category?.name ?? '—'} />
            <InfoRow icon={<Truck className="w-4 h-4" />} label="Proveedor" value={product.supplier?.name ?? '—'} />
            <InfoRow icon={<Package className="w-4 h-4" />} label="Unidad" value={product.unit} />
            <InfoRow label="Estado" value={
              <Badge variant={product.active ? 'success' : 'default'}>
                {product.active ? 'Activo' : 'Inactivo'}
              </Badge>
            } />
            <InfoRow label="Precio venta" value={`${product.price.toFixed(2)} €`} />
            <InfoRow label="Coste" value={product.cost != null ? `${product.cost.toFixed(2)} €` : '—'} />
            {margin && (
              <InfoRow
                icon={<TrendingUp className="w-4 h-4" />}
                label="Margen"
                value={
                  <span className={Number(margin) >= 60 ? 'text-green-600 font-semibold' : Number(margin) >= 30 ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {margin} %
                  </span>
                }
              />
            )}
          </div>
        </div>

        {/* Stock card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-slate-500 font-medium">Stock actual</p>
          <p className={`text-5xl font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-slate-900'}`}>
            {product.stock}
          </p>
          <p className="text-xs text-slate-400">{product.unit}</p>
          {product.stock <= 5 && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Stock bajo</span>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => adjustStock(-1)}
              disabled={adjusting || product.stock <= 0}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => adjustStock(1)}
              disabled={adjusting}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Historial de pedidos ({product.orderItems.length})</h2>
        {product.orderItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Este producto no aparece en ningún pedido aún</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-slate-600">
                <th className="text-left p-3 rounded-tl-lg">Pedido #</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Cantidad</th>
                <th className="text-left p-3">Precio unit.</th>
                <th className="text-left p-3 rounded-tr-lg">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {product.orderItems.map(item => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-gray-50">
                  <td className="p-3 font-medium">#{item.order.number}</td>
                  <td className="p-3 text-slate-500">{STATUS_LABELS[item.order.status] ?? item.order.status}</td>
                  <td className="p-3">{item.quantity} {product.unit}</td>
                  <td className="p-3">{item.price.toFixed(2)} €</td>
                  <td className="p-3 text-slate-400">{new Date(item.order.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editProduct={product}
        onSuccess={saved => {
          setProduct(prev => ({ ...prev, ...saved }))
          setShowModal(false)
        }}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-slate-400 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-slate-800 font-medium mt-0.5">{typeof value === 'string' ? value : <>{value}</>}</p>
      </div>
    </div>
  )
}
