'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin, FileText, ShoppingBag, Pencil, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CustomerModal } from '@/components/customers/CustomerModal'
import type { Customer } from '@/types'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'

interface Order {
  id: string
  number: number
  status: string
  total: number
  createdAt: Date | string
}

interface CustomerWithOrders {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count: { orders: number }
  orders: Order[]
}

interface Props {
  customer: CustomerWithOrders
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'En proceso',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusVariants: Record<string, 'default' | 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  IN_PROGRESS: 'warning',
  READY: 'success',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
}

export function CustomerDetailClient({ customer: initial }: Props) {
  const router = useRouter()
  const [customer, setCustomer] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSuccess = (updated: Customer) => {
    setCustomer((prev) => ({ ...prev, ...updated }))
    router.refresh()
  }

  const customerAsType: Customer = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    businessId: customer.businessId,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    _count: customer._count,
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Cliente desde{' '}
            {new Date(customer.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="outline">
          <Pencil size={15} />
          Editar cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Información de contacto</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm text-slate-700">{customer.email ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                  <p className="text-sm text-slate-700">{customer.phone ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Dirección</p>
                  <p className="text-sm text-slate-700">{customer.address ?? '—'}</p>
                </div>
              </div>
              {customer.notes && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Notas</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <ShoppingBag size={18} className="text-amber-600" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total pedidos</p>
                  <p className="text-xl font-bold text-amber-700">{customer._count.orders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Pedidos</h2>
            </div>

            {customer.orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ClipboardList size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Sin pedidos aún</p>
                <p className="text-slate-400 text-sm mt-1">
                  Los pedidos de este cliente aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Pedido #</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Estado</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Total</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">#{order.number}</td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariants[order.status] ?? 'default'}>
                            {statusLabels[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-slate-900">
                          {order.total.toFixed(2)} €
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editCustomer={customerAsType}
      />
    </>
  )
}
