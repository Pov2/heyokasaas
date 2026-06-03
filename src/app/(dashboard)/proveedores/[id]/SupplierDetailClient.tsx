'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin, FileText, Package, Pencil, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SupplierModal } from '@/components/suppliers/SupplierModal'
import type { Supplier } from '@/types'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  unit: string
  active: boolean
  createdAt: Date | string
}

interface SupplierWithProducts {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  category: string | null
  notes: string | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count: { products: number }
  products: Product[]
}

interface Props {
  supplier: SupplierWithProducts
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

export function SupplierDetailClient({ supplier: initial }: Props) {
  const router = useRouter()
  const [supplier, setSupplier] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSuccess = (updated: Supplier) => {
    setSupplier((prev) => ({ ...prev, ...updated }))
    router.refresh()
  }

  const supplierAsType: Supplier = {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    category: supplier.category,
    notes: supplier.notes,
    businessId: supplier.businessId,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
    _count: supplier._count,
  }

  const categoryColorClass = supplier.category
    ? (categoryColors[supplier.category] ?? 'bg-slate-100 text-slate-700')
    : null

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {supplier.category && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColorClass}`}
                >
                  {supplier.category}
                </span>
              )}
              <p className="text-slate-500 text-sm">
                Proveedor desde{' '}
                {new Date(supplier.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="outline">
          <Pencil size={15} />
          Editar proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Información de contacto</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm text-slate-700">{supplier.email ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                  <p className="text-sm text-slate-700">{supplier.phone ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Dirección</p>
                  <p className="text-sm text-slate-700">{supplier.address ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Categoría</p>
                  <p className="text-sm text-slate-700">{supplier.category ?? '—'}</p>
                </div>
              </div>
              {supplier.notes && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Notas</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{supplier.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Package size={18} className="text-amber-600" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total productos</p>
                  <p className="text-xl font-bold text-amber-700">{supplier._count.products}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Productos</h2>
            </div>

            {supplier.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Package size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Sin productos aún</p>
                <p className="text-slate-400 text-sm mt-1">
                  Los productos de este proveedor aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Producto</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Precio</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600">Stock</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {product.name}
                          {!product.active && (
                            <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-slate-900">
                          {product.price.toFixed(2)} €
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">
                          {product.stock}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {product.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <SupplierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editSupplier={supplierAsType}
      />
    </>
  )
}
