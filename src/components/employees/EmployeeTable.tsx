'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Employee } from '@/types'

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDeleted: (id: string) => void
}

function formatSalary(salary: number | null | undefined): string {
  if (salary == null) return '—'
  return (
    salary.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) +
    ' €/mes'
  )
}

export function EmployeeTable({ employees, onEdit, onDeleted }: EmployeeTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`¿Eliminar a ${employee.name}? Esta acción no se puede deshacer.`)) return
    setDeletingId(employee.id)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDeleted(employee.id)
      } else {
        const err = await res.json()
        alert(err.error ?? 'Error al eliminar')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Nombre</th>
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Puesto</th>
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Email</th>
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Teléfono</th>
            <th className="text-right px-6 py-3 font-semibold text-slate-600">Salario</th>
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Estado</th>
            <th className="text-left px-6 py-3 font-semibold text-slate-600">Fecha alta</th>
            <th className="text-right px-6 py-3 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/empleados/${employee.id}`)}
            >
              <td className="px-6 py-3 font-medium text-slate-900">{employee.name}</td>
              <td className="px-6 py-3 text-slate-600">{employee.position ?? '—'}</td>
              <td className="px-6 py-3 text-slate-500">{employee.email ?? '—'}</td>
              <td className="px-6 py-3 text-slate-500">{employee.phone ?? '—'}</td>
              <td className="px-6 py-3 text-right font-medium text-slate-700">
                {formatSalary(employee.salary)}
              </td>
              <td className="px-6 py-3">
                <Badge variant={employee.active ? 'success' : 'default'}>
                  {employee.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-3 text-slate-500">
                {new Date(employee.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td
                className="px-6 py-3 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    disabled={deletingId === employee.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
