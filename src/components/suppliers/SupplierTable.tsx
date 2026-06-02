'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Supplier } from '@/types'

interface SupplierTableProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onDeleted: (id: string) => void
}

const categoryColors: Record<string, string> = {
  'Bebidas': 'bg-blue-100 text-blue-700',
  'Carnes': 'bg-red-100 text-red-700',
  'Pescados': 'bg-cyan-100 text-cyan-700',
  'Frutas y Verduras': 'bg-green-100 text-green-700',
  'Lácteos': 'bg-yellow-100 text-yellow-700',
  'Panadería': 'bg-orange-100 text-orange-700',
  'Limpieza': 'bg-purple-100 text-purple-700',
  'Otros': 'bg-slate-100 text-slate-700',
}

function CategoryBadge({ category }: { category: string | null | undefined }) {
  if (!category) return <span className="text-slate-400">—</span>
  const colorClass = categoryColors[category] ?? 'bg-slate-100 text-slate-700'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {category}
    </span>
  )
}

export function SupplierTable({ suppliers, onEdit, onDeleted }: SupplierTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
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

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Truck size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay proveedores aún</p>
        <p className="text-slate-400 text-sm mt-1">
          Crea tu primer proveedor con el botón &quot;Nuevo proveedor&quot;
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
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Teléfono</th>
            <th className="text-center px-4 py-3 font-semibold text-slate-600">Productos</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha alta</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/proveedores/${supplier.id}`}
                  className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
                >
                  {supplier.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={supplier.category} />
              </td>
              <td className="px-4 py-3 text-slate-500">{supplier.email ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500">{supplier.phone ?? '—'}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  {supplier._count?.products ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(supplier.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {confirmId === supplier.id ? (
                    <>
                      <span className="text-xs text-slate-500 mr-1">¿Eliminar?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(supplier.id)}
                        disabled={deletingId === supplier.id}
                      >
                        {deletingId === supplier.id ? '...' : 'Sí'}
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
                        onClick={() => onEdit(supplier)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmId(supplier.id)}
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
