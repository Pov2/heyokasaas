'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { EmployeeForm, EmployeeFormData } from './EmployeeForm'
import type { Employee } from '@/types'

interface EmployeeModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (employee: Employee) => void
  editEmployee?: Employee | null
}

export function EmployeeModal({ open, onClose, onSuccess, editEmployee }: EmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true)
    try {
      const url = editEmployee ? `/api/employees/${editEmployee.id}` : '/api/employees'
      const method = editEmployee ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          salary: data.salary !== '' ? Number(data.salary) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      const employee = await res.json()
      onSuccess(employee)
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
            {editEmployee ? 'Editar empleado' : 'Nuevo empleado'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <EmployeeForm
            initial={editEmployee ?? undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
