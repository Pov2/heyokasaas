'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Briefcase, DollarSign, Pencil, ToggleLeft, ToggleRight, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmployeeModal } from '@/components/employees/EmployeeModal'
import type { Employee } from '@/types'

interface Props {
  employee: Employee
}

export function EmployeeDetailClient({ employee: initial }: Props) {
  const router = useRouter()
  const [employee, setEmployee] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleSuccess = (updated: Employee) => {
    setEmployee(updated)
    router.refresh()
  }

  const handleToggleActive = async () => {
    setToggling(true)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !employee.active }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEmployee(updated)
        router.refresh()
      }
    } finally {
      setToggling(false)
    }
  }

  const formatSalary = (salary: number | null | undefined) => {
    if (salary == null) return '—'
    return salary.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €/mes'
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
            <Badge variant={employee.active ? 'success' : 'default'}>
              {employee.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            {employee.position ?? 'Sin puesto asignado'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleActive}
            disabled={toggling}
            className="gap-2"
          >
            {employee.active ? (
              <>
                <ToggleRight size={16} className="text-green-500" />
                {toggling ? 'Actualizando...' : 'Marcar inactivo'}
              </>
            ) : (
              <>
                <ToggleLeft size={16} className="text-slate-400" />
                {toggling ? 'Actualizando...' : 'Marcar activo'}
              </>
            )}
          </Button>
          <Button onClick={() => setModalOpen(true)} variant="outline">
            <Pencil size={15} />
            Editar empleado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Información del empleado</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Puesto</p>
                <p className="text-sm text-slate-700">{employee.position ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                <p className="text-sm text-slate-700">{employee.email ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                <p className="text-sm text-slate-700">{employee.phone ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Salario</p>
                <p className="text-sm text-slate-700">{formatSalary(employee.salary)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Fecha de alta</p>
                <p className="text-sm text-slate-700">
                  {new Date(employee.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Salary highlight */}
          {employee.salary != null && employee.salary > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <DollarSign size={18} className="text-amber-600" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">Coste mensual</p>
                  <p className="text-xl font-bold text-amber-700">{formatSalary(employee.salary)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Estado</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">Estado actual</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {employee.active
                    ? 'El empleado está activo y en plantilla'
                    : 'El empleado está marcado como inactivo'}
                </p>
              </div>
              <Badge variant={employee.active ? 'success' : 'default'}>
                {employee.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">Última actualización</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(employee.updatedAt).toLocaleDateString('es-ES', {
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

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editEmployee={employee}
      />
    </>
  )
}
