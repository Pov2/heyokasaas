'use client'

import { Users, Phone, StickyNote, Pencil, Trash2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Reservation } from '@/types'

interface ReservationCardProps {
  reservation: Reservation
  onEdit: (r: Reservation) => void
  onDelete: (id: string) => void
  onToggleConfirmed: (r: Reservation) => void
  toggling?: boolean
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ReservationCard({ reservation, onEdit, onDelete, onToggleConfirmed, toggling }: ReservationCardProps) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 ${reservation.confirmed ? 'border-green-200' : 'border-amber-200'}`}>
      {/* Top row: time + badge */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-900 tabular-nums">
          {formatTime(reservation.date)}
        </span>
        <Badge variant={reservation.confirmed ? 'success' : 'warning'}>
          {reservation.confirmed ? 'Confirmada' : 'Pendiente'}
        </Badge>
      </div>

      {/* Client name */}
      <p className="font-semibold text-slate-800 text-base leading-tight">{reservation.name}</p>

      {/* Party size */}
      <div className="flex items-center gap-1.5 text-slate-600 text-sm">
        <Users size={14} className="text-slate-400" />
        <span>{reservation.partySize} {reservation.partySize === 1 ? 'comensal' : 'comensales'}</span>
      </div>

      {/* Phone */}
      {reservation.phone && (
        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
          <Phone size={14} className="text-slate-400" />
          <span>{reservation.phone}</span>
        </div>
      )}

      {/* Notes */}
      {reservation.notes && (
        <div className="flex items-start gap-1.5 text-slate-500 text-sm">
          <StickyNote size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{reservation.notes}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          size="sm"
          variant={reservation.confirmed ? 'outline' : 'default'}
          onClick={() => onToggleConfirmed(reservation)}
          disabled={toggling}
          className="flex-1 gap-1.5"
        >
          <Check size={13} />
          {reservation.confirmed ? 'Desconfirmar' : 'Confirmar'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(reservation)}>
          <Pencil size={13} />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(reservation.id)}>
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}
