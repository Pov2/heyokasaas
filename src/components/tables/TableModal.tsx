'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Users, UtensilsCrossed, ExternalLink, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { RestaurantTable } from '@/types'

const statusLabels: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' | 'success' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'destructive' },
  CONFIRMED: { label: 'Confirmado', variant: 'warning' },
  IN_PROGRESS: { label: 'En curso', variant: 'warning' },
  READY: { label: 'Listo', variant: 'default' },
  DELIVERED: { label: 'Entregado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'outline' },
}

interface TableModalProps {
  table: RestaurantTable | null
  onClose: () => void
  onRefresh: () => void
}

export function TableModal({ table, onClose, onRefresh }: TableModalProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ number: '', name: '', capacity: '' })

  if (!table) return null

  const handleStartEdit = () => {
    setForm({
      number: String(table.number),
      name: table.name ?? '',
      capacity: String(table.capacity),
    })
    setEditing(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: Number(form.number),
          name: form.name || null,
          capacity: Number(form.capacity),
        }),
      })
      if (res.ok) {
        setEditing(false)
        onRefresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleNewOrder = async () => {
    setSaving(true)
    try {
      // Create a new order assigned to this table
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: table.id, notes: null }),
      })
      if (res.ok) {
        const order = await res.json()
        onClose()
        router.push(`/dashboard/pedidos/${order.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRelease = async () => {
    if (!confirm('¿Liberar esta mesa? El pedido activo se desasignará.')) return
    setReleasing(true)
    try {
      const res = await fetch(`/api/tables/${table.id}/assign`, { method: 'PATCH' })
      if (res.ok) {
        onRefresh()
        onClose()
      }
    } finally {
      setReleasing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta mesa? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tables/${table.id}`, { method: 'DELETE' })
      if (res.ok) {
        onRefresh()
        onClose()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Error al eliminar')
      }
    } finally {
      setDeleting(false)
    }
  }

  const statusInfo = table.currentOrder
    ? statusLabels[table.currentOrder.status] ?? { label: table.currentOrder.status, variant: 'default' as const }
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="text-amber-700 font-bold text-lg">{table.number}</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Mesa {table.number}{table.name ? ` — ${table.name}` : ''}
              </h2>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Users size={13} />
                <span>{table.capacity} personas</span>
                {!table.active && (
                  <Badge variant="outline" className="ml-1">Inactiva</Badge>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Número
                </label>
                <input
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Terraza, Privado..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : table.currentOrder ? (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Pedido #{table.currentOrder.number}
                  </span>
                  {statusInfo && (
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Total</span>
                  <span className="font-bold text-slate-900">
                    {table.currentOrder.total.toFixed(2)} €
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    onClose()
                    router.push(`/dashboard/pedidos/${table.currentOrder!.id}`)
                  }}
                >
                  <ExternalLink size={14} />
                  Ver comanda
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRelease}
                  disabled={releasing}
                  className="flex-1"
                >
                  {releasing ? 'Liberando...' : 'Liberar mesa'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <UtensilsCrossed size={24} className="text-green-600" />
              </div>
              <p className="text-slate-600 text-sm text-center">
                Mesa libre — no hay pedido activo
              </p>
              <Button onClick={handleNewOrder} disabled={saving} className="w-full gap-2">
                <UtensilsCrossed size={16} />
                {saving ? 'Creando comanda...' : 'Nueva comanda'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!editing && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleStartEdit} className="gap-1.5">
              <Edit2 size={14} />
              Editar mesa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
