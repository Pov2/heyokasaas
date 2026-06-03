'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types'

interface CustomerTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDeleted: (id: string) => void
}

export function CustomerTable({ customers, onEdit, onDeleted }: CustomerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Error al eliminar')
        return
      }
      onDeleted(id)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Users size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay clientes aún</p>
        <p className="text-slate-400 text-sm mt-1">
          Crea tu primer cliente con el botón &quot;Nuevo cliente&quot;
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Nombre</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Teléfono</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Dirección</th>
            <th className="text-center px-4 py-3 font-semibold text-slate-600">Pedidos</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha alta</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/clientes/${customer.id}`}
                  className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
                >
                  {customer.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{customer.email ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500">{customer.phone ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                {customer.address ?? '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  {customer._count?.orders ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(customer.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {confirmId === customer.id ? (
                    <>
                      <span className="text-xs text-slate-500 mr-1">¿Eliminar?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        disabled={deletingId === customer.id}
                      >
                        {deletingId === customer.id ? '...' : 'Sí'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(customer)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmId(customer.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
