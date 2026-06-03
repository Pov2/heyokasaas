'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ClipboardList, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OrderTable } from '@/components/orders/OrderTable'
import { OrderModal } from '@/components/orders/OrderModal'
import type { Order, OrderStatus } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'IN_PROGRESS', label: 'En preparación' },
  { value: 'READY', label: 'Listo' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export default function PedidosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '')
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') ?? 'today')
  const [showModal, setShowModal] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (dateFilter) params.set('date', dateFilter)
    const res = await fetch(`/api/orders?${params.toString()}`)
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }, [search, statusFilter, dateFilter])

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300)
    return () => clearTimeout(timer)
  }, [fetchOrders])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (dateFilter) params.set('date', dateFilter)
    router.replace(`/pedidos?${params.toString()}`)
  }, [search, statusFilter, dateFilter, router])

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday)
  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const inProgressOrders = orders.filter(o => o.status === 'IN_PROGRESS')
  const deliveredToday = todayOrders.filter(o => o.status === 'DELIVERED')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos / Comandas</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los pedidos de tu negocio</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo pedido
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos hoy', value: todayOrders.length },
          { label: 'Pendientes', value: pendingOrders.length },
          { label: 'En preparación', value: inProgressOrders.length },
          { label: 'Entregados hoy', value: deliveredToday.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente o número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="">Todos</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay pedidos</p>
          <p className="text-slate-400 text-sm mb-6">Crea tu primer pedido</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo pedido
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <OrderTable
            orders={orders}
            onStatusChange={(id, status) =>
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
            }
            onDeleted={id => setOrders(prev => prev.filter(o => o.id !== id))}
          />
        </div>
      )}

      <OrderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={order => {
          setOrders(prev => [order, ...prev])
          setShowModal(false)
        }}
      />
    </div>
  )
}
