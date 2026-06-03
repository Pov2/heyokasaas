'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ReservationForm, ReservationFormData } from './ReservationForm'
import type { Reservation } from '@/types'

interface ReservationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (reservation: Reservation) => void
  editReservation?: Reservation | null
}

export function ReservationModal({ open, onClose, onSuccess, editReservation }: ReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (data: ReservationFormData) => {
    setIsLoading(true)
    try {
      const url = editReservation ? `/api/reservations/${editReservation.id}` : '/api/reservations'
      const method = editReservation ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone || null,
          date: data.date,
          partySize: Number(data.partySize),
          notes: data.notes || null,
          confirmed: data.confirmed,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      const reservation = await res.json()
      onSuccess(reservation)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {editReservation ? 'Editar reserva' : 'Nueva reserva'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <ReservationForm
            initial={editReservation ?? undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
