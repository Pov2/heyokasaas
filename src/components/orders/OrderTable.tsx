'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { Order, OrderStatus } from '@/types'

interface OrderTableProps {
  orders: Order[]
  onStatusChange: (id: string, status: OrderStatus) => void
  onDeleted: (id: string) => void
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'DELIVERED',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Confirmar',
  CONFIRMED: 'Preparar',
  IN_PROGRESS: 'Listo',
  READY: 'Entregar',
}

export function OrderTable({ orders, onStatusChange, onDeleted }: OrderTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleAdvance = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setLoadingId(order.id)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        onStatusChange(order.id, next)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Error al eliminar')
        return
      }
      onDeleted(id)
    } finally {
      setLoadingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-medium">No hay pedidos</p>
        <p className="text-sm mt-1">Crea tu primer pedido con el botón &quot;Nuevo pedido&quot;</p>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">#</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Cliente</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Items</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const orderDate = new Date(order.createdAt)
            const isToday = orderDate >= today
            return (
              <tr
                key={order.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isToday ? 'bg-amber-50/30' : ''}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <Link href={`/pedidos/${order.id}`} className="hover:text-amber-600 transition-colors">
                    #{order.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {order.customer?.name ?? <span className="text-slate-400">Sin cliente</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.items.length} art.
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {order.total.toFixed(2)} €
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {orderDate.toLocaleDateString('es-ES')} {orderDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/pedidos/${order.id}`}>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Ver detalle">
                        <Eye size={15} />
                      </button>
                    </Link>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => handleAdvance(order)}
                        disabled={loadingId === order.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        title="Avanzar estado"
                      >
                        {NEXT_LABEL[order.status]}
                        <ChevronRight size={12} />
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                      confirmDeleteId === order.id ? (
                        <>
                          <span className="text-xs text-slate-500">¿Eliminar?</span>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)} disabled={loadingId === order.id}>
                            {loadingId === order.id ? '...' : 'Sí'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>No</Button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(order.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
