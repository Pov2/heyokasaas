'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Truck } from 'lucide-react'
import { SupplierTable } from '@/components/suppliers/SupplierTable'
import { SupplierModal } from '@/components/suppliers/SupplierModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import type { Supplier } from '@/types'

const CATEGORIES = [
  'Bebidas',
  'Carnes',
  'Pescados',
  'Frutas y Verduras',
  'Lácteos',
  'Panadería',
  'Limpieza',
  'Otros',
]

export default function ProveedoresContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const fetchSuppliers = useCallback(async (q: string, cat: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (cat) params.set('category', cat)
      params.set('page', String(p))
      params.set('limit', '20')
      const url = `/api/suppliers?${params.toString()}`
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        setSuppliers(json.data)
        setPagination({ total: json.pagination.total, totalPages: json.pagination.totalPages })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers(search, category, page)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      router.replace(`/proveedores${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, category, page, fetchSuppliers, router])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, category])

  const handleSuccess = (supplier: Supplier) => {
    setSuppliers((prev) => {
      const exists = prev.find((s) => s.id === supplier.id)
      if (exists) return prev.map((s) => (s.id === supplier.id ? supplier : s))
      return [supplier, ...prev]
    })
  }

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier)
    setModalOpen(true)
  }

  const handleDeleted = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading
              ? 'Cargando...'
              : `${pagination.total} proveedor${pagination.total !== 1 ? 'es' : ''} registrado${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditSupplier(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <Truck size={16} />
          Nuevo proveedor
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / States */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Cargando proveedores...</p>
          </div>
        ) : suppliers.length === 0 && (search || category) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sin resultados</p>
            <p className="text-slate-400 text-sm mt-1">
              No se encontraron proveedores con los filtros aplicados
            </p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Truck size={28} className="text-amber-500" />
            </div>
            <p className="text-slate-700 font-semibold text-lg">No tienes proveedores aún</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Empieza añadiendo tu primer proveedor</p>
            <Button
              onClick={() => {
                setEditSupplier(null)
                setModalOpen(true)
              }}
            >
              <Truck size={16} />
              Crear primer proveedor
            </Button>
          </div>
        ) : (
          <>
            <SupplierTable suppliers={suppliers} onEdit={handleEdit} onDeleted={handleDeleted} />
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <SupplierModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditSupplier(null)
        }}
        onSuccess={handleSuccess}
        editSupplier={editSupplier}
      />
    </div>
  )
}
