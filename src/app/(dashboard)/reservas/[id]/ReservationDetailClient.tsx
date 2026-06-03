'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, Phone, StickyNote, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReservationModal } from '@/components/reservations/ReservationModal'
import type { Reservation } from '@/types'

interface Props {
  reservation: Reservation
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ReservationDetailClient({ reservation: initial }: Props) {
  const router = useRouter()
  const [reservation, setReservation] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSuccess = (updated: Reservation) => {
    setReservation(updated)
    router.refresh()
  }

  const handleToggleConfirmed = async () => {
    setToggling(true)
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: !reservation.confirmed }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReservation(updated)
        router.refresh()
      }
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/reservas')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{reservation.name}</h1>
            <Badge variant={reservation.confirmed ? 'success' : 'warning'}>
              {reservation.confirmed ? 'Confirmada' : 'Pendiente'}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            {formatDate(reservation.date)} · {formatTime(reservation.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleConfirmed}
            disabled={toggling}
            className="gap-2"
          >
            {reservation.confirmed ? (
              <>
                <XCircle size={16} className="text-amber-500" />
                {toggling ? 'Actualizando...' : 'Marcar pendiente'}
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-500" />
                {toggling ? 'Actualizando...' : 'Confirmar reserva'}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setModalOpen(true)} className="gap-2">
            <Pencil size={15} />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
            <Trash2 size={15} />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Información de la reserva</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Fecha</p>
                <p className="text-sm text-slate-700">{formatDate(reservation.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Hora</p>
                <p className="text-sm text-slate-700 font-mono text-base font-semibold">
                  {formatTime(reservation.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Comensales</p>
                <p className="text-sm text-slate-700">
                  {reservation.partySize} {reservation.partySize === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>
            {reservation.phone && (
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                  <p className="text-sm text-slate-700">{reservation.phone}</p>
                </div>
              </div>
            )}
            {reservation.notes && (
              <div className="flex items-start gap-3">
                <StickyNote size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Notas</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{reservation.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Estado</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">Estado actual</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {reservation.confirmed
                    ? 'La reserva está confirmada'
                    : 'La reserva está pendiente de confirmación'}
                </p>
              </div>
              <Badge variant={reservation.confirmed ? 'success' : 'warning'}>
                {reservation.confirmed ? 'Confirmada' : 'Pendiente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">Creada el</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">Última actualización</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(reservation.updatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editReservation={reservation}
      />
    </>
  )
}
