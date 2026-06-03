'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OrderStatusBadge, STATUS_CONFIG } from '@/components/orders/OrderStatusBadge'
import { OrderModal } from '@/components/orders/OrderModal'
import type { Order, OrderStatus } from '@/types'

const PIPELINE: OrderStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED']

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'DELIVERED',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Confirmar pedido',
  CONFIRMED: 'Iniciar preparación',
  IN_PROGRESS: 'Marcar listo',
  READY: 'Marcar entregado',
}

export default function OrderDetailClient({ order: initial }: { order: Order }) {
  const [order, setOrder] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const advanceStatus = async () => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setAdvancing(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) setOrder(await res.json())
    } finally {
      setAdvancing(false)
    }
  }

  const cancelOrder = async () => {
    if (!confirm('¿Cancelar este pedido?')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (res.ok) setOrder(await res.json())
    } finally {
      setCancelling(false)
    }
  }

  const isCancelled = order.status === 'CANCELLED'
  const isDelivered = order.status === 'DELIVERED'
  const canAdvance = !isCancelled && !isDelivered && NEXT_STATUS[order.status]
  const canCancel = !isCancelled && !isDelivered

  const currentStep = isCancelled ? -1 : PIPELINE.indexOf(order.status)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pedidos">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Pedido #{order.number}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {order.customer ? `Cliente: ${order.customer.name}` : 'Sin cliente'} ·{' '}
            {new Date(order.createdAt).toLocaleString('es-ES')}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowModal(true)} className="gap-2">
          <Pencil className="w-4 h-4" /> Editar
        </Button>
      </div>

      {/* Status pipeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Estado del pedido</h2>
          <div className="flex items-center">
            {PIPELINE.map((step, idx) => {
              const isDone = idx < currentStep
              const isCurrent = idx === currentStep
              const config = STATUS_CONFIG[step]
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-amber-500 text-white'
                          : isCurrent
                          ? 'bg-white border-2 border-amber-500 text-amber-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs ${isCurrent ? 'text-amber-600 font-semibold' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                      {config.label}
                    </span>
                  </div>
                  {idx < PIPELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentStep ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium">Este pedido ha sido cancelado.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items table */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Artículos</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 font-medium text-slate-600">Producto</th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">Cant.</th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">P. unit.</th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{item.product.name}</td>
                  <td className="px-3 py-2 text-right">{item.quantity} {item.product.unit}</td>
                  <td className="px-3 py-2 text-right">{item.price.toFixed(2)} €</td>
                  <td className="px-3 py-2 text-right font-semibold">{(item.quantity * item.price).toFixed(2)} €</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="px-3 py-3 text-right font-bold text-slate-700">Total</td>
                <td className="px-3 py-3 text-right font-bold text-lg text-slate-900">{order.total.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sidebar info + actions */}
        <div className="space-y-4">
          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-2">Notas</h2>
            {order.notes ? (
              <p className="text-sm text-slate-600">{order.notes}</p>
            ) : (
              <p className="text-sm text-slate-400">Sin notas</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h2 className="font-semibold text-slate-700 mb-2">Acciones</h2>
            {canAdvance && (
              <Button
                className="w-full"
                onClick={advanceStatus}
                disabled={advancing}
              >
                {advancing ? 'Actualizando...' : NEXT_LABEL[order.status]}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={cancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
              </Button>
            )}
            {!canAdvance && !canCancel && (
              <p className="text-sm text-slate-400">No hay acciones disponibles</p>
            )}
          </div>
        </div>
      </div>

      <OrderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editOrder={order}
        onSuccess={updated => {
          setOrder(updated)
          setShowModal(false)
        }}
      />
    </div>
  )
}
