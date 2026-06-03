'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { UtensilsCrossed, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductModal } from '@/components/products/ProductModal'
import type { Product, Category } from '@/types'

export default function CartaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '')
  const [activeFilter, setActiveFilter] = useState(searchParams.get('active') ?? '')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    if (activeFilter) params.set('active', activeFilter)
    params.set('page', String(page))
    params.set('limit', '20')
    const res = await fetch(`/api/products?${params.toString()}`)
    if (res.ok) {
      const json = await res.json()
      setProducts(json.data)
      setPagination({ total: json.pagination.total, totalPages: json.pagination.totalPages })
    }
    setLoading(false)
  }, [search, categoryFilter, activeFilter, page])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    if (activeFilter) params.set('active', activeFilter)
    router.replace(`/carta?${params.toString()}`)
  }, [search, categoryFilter, activeFilter, router])

  // Reset page on filter changes
  useEffect(() => { setPage(1) }, [search, categoryFilter, activeFilter])

  const activeProducts = products.filter(p => p.active)
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * (p.cost ?? 0)), 0)
  const avgMargin = activeProducts.length > 0
    ? activeProducts
        .filter(p => p.cost != null && p.price > 0)
        .reduce((acc, p) => acc + ((p.price - (p.cost ?? 0)) / p.price * 100), 0) /
      (activeProducts.filter(p => p.cost != null && p.price > 0).length || 1)
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carta / Productos</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total productos', value: pagination.total },
          { label: 'Activos', value: activeProducts.length },
          { label: 'Valor stock', value: `${totalStockValue.toFixed(2)} €` },
          { label: 'Margen medio', value: `${avgMargin.toFixed(1)} %` },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Todos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay productos</p>
          <p className="text-slate-400 text-sm mb-6">Añade tu primer producto a la carta</p>
          <Button onClick={() => { setEditProduct(null); setShowModal(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo producto
          </Button>
        </div>
      ) : (
        <>
          <ProductTable
            products={products}
            onEdit={p => { setEditProduct(p); setShowModal(true) }}
            onDeleted={id => setProducts(prev => prev.filter(p => p.id !== id))}
          />
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}

      <ProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editProduct={editProduct}
        onSuccess={saved => {
          setProducts(prev =>
            editProduct
              ? prev.map(p => p.id === saved.id ? saved : p)
              : [saved, ...prev]
          )
          setShowModal(false)
        }}
      />
    </div>
  )
}
