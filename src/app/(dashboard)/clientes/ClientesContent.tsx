'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, UserPlus, Users } from 'lucide-react'
import { CustomerTable } from '@/components/customers/CustomerTable'
import { CustomerModal } from '@/components/customers/CustomerModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import type { Customer } from '@/types'

export default function ClientesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)

  const fetchCustomers = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      params.set('page', String(p))
      params.set('limit', '20')
      const res = await fetch(`/api/customers?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setCustomers(json.data)
        setPagination({ total: json.pagination.total, totalPages: json.pagination.totalPages })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search, page)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      router.replace(`/clientes${search ? `?${params.toString()}` : ''}`, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, page, fetchCustomers, router])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  const handleSuccess = (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id)
      if (exists) return prev.map((c) => (c.id === customer.id ? customer : c))
      return [customer, ...prev]
    })
  }

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer)
    setModalOpen(true)
  }

  const handleDeleted = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading
              ? 'Cargando...'
              : `${pagination.total} cliente${pagination.total !== 1 ? 's' : ''} registrado${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditCustomer(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <UserPlus size={16} />
          Nuevo cliente
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table / States */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Cargando clientes...</p>
          </div>
        ) : customers.length === 0 && search ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sin resultados</p>
            <p className="text-slate-400 text-sm mt-1">
              No se encontraron clientes para &quot;{search}&quot;
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Users size={28} className="text-amber-500" />
            </div>
            <p className="text-slate-700 font-semibold text-lg">No tienes clientes aún</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Empieza añadiendo tu primer cliente</p>
            <Button
              onClick={() => {
                setEditCustomer(null)
                setModalOpen(true)
              }}
            >
              <UserPlus size={16} />
              Crear primer cliente
            </Button>
          </div>
        ) : (
            <>
            <CustomerTable customers={customers} onEdit={handleEdit} onDeleted={handleDeleted} />
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <CustomerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditCustomer(null)
        }}
        onSuccess={handleSuccess}
        editCustomer={editCustomer}
      />
    </div>
  )
}
