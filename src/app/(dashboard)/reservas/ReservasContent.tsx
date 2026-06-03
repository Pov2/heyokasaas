'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, List, Plus, Users, CheckCircle, Clock } from 'lucide-react'
import { ReservationCard } from '@/components/reservations/ReservationCard'
import { ReservationModal } from '@/components/reservations/ReservationModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Reservation } from '@/types'

type View = 'day' | 'list'
type ConfirmedFilter = '' | 'true' | 'false'

function toDateInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ReservasContent() {
  const [view, setView] = useState<View>('day')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(toDateInputValue(new Date()))
  const [confirmedFilter, setConfirmedFilter] = useState<ConfirmedFilter>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editReservation, setEditReservation] = useState<Reservation | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (view === 'day') {
        params.set('date', selectedDate)
      } else {
        params.set('upcoming', 'true')
      }
      if (confirmedFilter) params.set('confirmed', confirmedFilter)
      const res = await fetch(`/api/reservations?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        // Support both paginated { data: [...] } and plain array responses
        setReservations(Array.isArray(json) ? json : json.data)
      }
    } finally {
      setLoading(false)
    }
  }, [view, selectedDate, confirmedFilter])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleSuccess = (reservation: Reservation) => {
    setReservations((prev) => {
      const exists = prev.find((r) => r.id === reservation.id)
      if (exists) return prev.map((r) => (r.id === reservation.id ? reservation : r))
      return [...prev, reservation].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })
  }

  const handleEdit = (r: Reservation) => {
    setEditReservation(r)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setReservations((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const handleToggleConfirmed = async (r: Reservation) => {
    setTogglingId(r.id)
    try {
      const res = await fetch(`/api/reservations/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: !r.confirmed }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReservations((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      }
    } finally {
      setTogglingId(null)
    }
  }

  // Stats for day view
  const total = reservations.length
  const totalComensales = reservations.reduce((s, r) => s + r.partySize, 0)
  const confirmadas = reservations.filter((r) => r.confirmed).length
  const pendientes = reservations.filter((r) => !r.confirmed).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Cargando...' : `${total} reserva${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditReservation(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus size={16} />
          Nueva reserva
        </Button>
      </div>

      {/* View tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Tabs */}
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setView('day')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              view === 'day'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CalendarDays size={15} />
            Vista día
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <List size={15} />
            Vista lista
          </button>
        </div>

        {/* Date picker (day view only) */}
        {view === 'day' && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          />
        )}

        {/* Confirmed filter */}
        <select
          value={confirmedFilter}
          onChange={(e) => setConfirmedFilter(e.target.value as ConfirmedFilter)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
        >
          <option value="">Todas</option>
          <option value="true">Confirmadas</option>
          <option value="false">Pendientes</option>
        </select>
      </div>

      {/* Stats (day view) */}
      {view === 'day' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarDays size={18} className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Reservas del día</p>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Comensales</p>
                <p className="text-2xl font-bold text-slate-900">{totalComensales}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Confirmadas</p>
                <p className="text-2xl font-bold text-slate-900">{confirmadas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendientes</p>
                <p className="text-2xl font-bold text-slate-900">{pendientes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Cargando reservas...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <CalendarDays size={28} className="text-amber-500" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">No hay reservas</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            {view === 'day' ? 'No hay reservas para este día' : 'No hay próximas reservas'}
          </p>
          <Button
            onClick={() => {
              setEditReservation(null)
              setModalOpen(true)
            }}
          >
            <Plus size={16} />
            Crear primera reserva
          </Button>
        </div>
      ) : view === 'day' ? (
        // Day view — cards grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reservations.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleConfirmed={handleToggleConfirmed}
              toggling={togglingId === r.id}
            />
          ))}
        </div>
      ) : (
        // List view — table
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Comensales</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 font-mono text-slate-900 font-medium">{formatTime(r.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.name}</p>
                      {r.phone && <p className="text-xs text-slate-400">{r.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users size={13} className="text-slate-400" />
                        {r.partySize}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs">
                      <span className="line-clamp-1">{r.notes ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.confirmed ? 'success' : 'warning'}>
                        {r.confirmed ? 'Confirmada' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleConfirmed(r)}
                          disabled={togglingId === r.id}
                          className="text-xs"
                        >
                          {r.confirmed ? 'Desconfirmar' : 'Confirmar'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(r)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ReservationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditReservation(null)
        }}
        onSuccess={handleSuccess}
        editReservation={editReservation}
      />
    </div>
  )
}
