'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LayoutGrid, List, Users, CheckCircle, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TableMapEditor } from '@/components/tables/TableMapEditor'
import { TableModal } from '@/components/tables/TableModal'
import type { RestaurantTable } from '@/types'

type View = 'mapa' | 'lista'

function getStatusBadge(table: RestaurantTable) {
  if (!table.active) return <Badge variant="outline">Inactiva</Badge>
  if (!table.currentOrder) return <Badge variant="success">Libre</Badge>
  const s = table.currentOrder.status
  if (s === 'PENDING') return <Badge variant="destructive">Pendiente</Badge>
  if (s === 'READY') return <Badge>Lista</Badge>
  return <Badge variant="warning">Ocupada</Badge>
}

interface AddTableModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (table: RestaurantTable) => void
}

function AddTableModal({ open, onClose, onSuccess }: AddTableModalProps) {
  const [form, setForm] = useState({ number: '', name: '', capacity: '4' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.number || !form.capacity) {
      setError('Número y capacidad son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: Number(form.number),
          name: form.name || null,
          capacity: Number(form.capacity),
          posX: 20,
          posY: 20,
        }),
      })
      if (res.ok) {
        const table = await res.json()
        onSuccess({ ...table, currentOrder: null })
        onClose()
        setForm({ number: '', name: '', capacity: '4' })
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al crear mesa')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Nueva mesa</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Número *
            </label>
            <input
              type="number"
              min={1}
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
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
              Capacidad *
            </label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Creando...' : 'Crear mesa'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MesasContent() {
  const [view, setView] = useState<View>('mapa')
  const [editMode, setEditMode] = useState(false)
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/tables')
      if (res.ok) {
        const data = await res.json()
        setTables(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTables, 30000)
    return () => clearInterval(interval)
  }, [fetchTables])

  const handleTableAdded = (table: RestaurantTable) => {
    setTables((prev) => [...prev, table])
  }

  const handlePositionsChange = (updated: RestaurantTable[]) => {
    setTables((prev) => {
      const map = new Map(updated.map((t) => [t.id, t]))
      return prev.map((t) => map.get(t.id) ?? t)
    })
  }

  // Stats
  const total = tables.length
  const libres = tables.filter((t) => t.active && !t.currentOrder).length
  const ocupadas = tables.filter((t) => t.active && !!t.currentOrder).length
  const comensalesAhora = tables
    .filter((t) => t.active && !!t.currentOrder)
    .reduce((sum, t) => sum + t.capacity, 0)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa de Mesas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Cargando...' : `${total} mesa${total !== 1 ? 's' : ''} configuradas`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === 'mapa' && (
            <Button
              size="sm"
              variant={editMode ? 'default' : 'outline'}
              onClick={() => setEditMode((v) => !v)}
              className="gap-1.5"
            >
              <LayoutGrid size={14} />
              {editMode ? 'Vista normal' : 'Editar disposición'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <LayoutGrid size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total mesas</p>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Mesas libres</p>
              <p className="text-2xl font-bold text-slate-900">{libres}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Mesas ocupadas</p>
              <p className="text-2xl font-bold text-slate-900">{ocupadas}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Comensales ahora</p>
              <p className="text-2xl font-bold text-slate-900">{comensalesAhora}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden w-fit mb-4">
        <button
          onClick={() => setView('mapa')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === 'mapa' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid size={15} />
          Vista mapa
        </button>
        <button
          onClick={() => setView('lista')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === 'lista' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <List size={15} />
          Vista lista
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Cargando mesas...</p>
        </div>
      ) : view === 'mapa' ? (
        <TableMapEditor
          tables={tables}
          editMode={editMode}
          onTableClick={setSelectedTable}
          onPositionsChange={handlePositionsChange}
          onAddTable={() => setAddModalOpen(true)}
        />
      ) : (
        /* List view */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {total} mesa{total !== 1 ? 's' : ''}
            </p>
            <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
              <Plus size={14} />
              Añadir mesa
            </Button>
          </div>
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LayoutGrid size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No hay mesas configuradas</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Añade tu primera mesa para empezar</p>
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus size={16} />
                Añadir mesa
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Número</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Capacidad</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido activo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 text-base">{table.number}</td>
                      <td className="px-4 py-3 text-slate-600">{table.name ?? <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Users size={13} className="text-slate-400" />
                          {table.capacity}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(table)}</td>
                      <td className="px-4 py-3">
                        {table.currentOrder ? (
                          <span className="text-slate-700 font-medium">#{table.currentOrder.number}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTable(table)}
                        >
                          Gestionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Table detail modal */}
      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={() => {
            setSelectedTable(null)
            fetchTables()
          }}
        />
      )}

      {/* Add table modal */}
      <AddTableModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleTableAdded}
      />
    </div>
  )
}
