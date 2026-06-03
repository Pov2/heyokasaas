'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Package, Search, Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StockTable } from '@/components/stock/StockTable'
import type { Product, Category } from '@/types'

export default function StockContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '')
  const [onlyProblems, setOnlyProblems] = useState(searchParams.get('problems') === 'true')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    if (onlyProblems) params.set('low', 'true')
    params.set('page', String(page))
    params.set('limit', '20')
    const res = await fetch(`/api/stock?${params.toString()}`)
    if (res.ok) {
      const json = await res.json()
      setProducts(json.data)
      setPagination({ total: json.pagination.total, totalPages: json.pagination.totalPages })
    }
    setLoading(false)
  }, [search, categoryFilter, onlyProblems, page])

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
    if (onlyProblems) params.set('problems', 'true')
    router.replace(`/stock?${params.toString()}`)
  }, [search, categoryFilter, onlyProblems, router])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, categoryFilter, onlyProblems])

  const sinStock = products.filter(p => p.stock === 0).length
  const critico = products.filter(p => p.stock >= 1 && p.stock <= 5).length
  const bajo = products.filter(p => p.stock >= 6 && p.stock <= 10).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Stock</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona el inventario de tus productos</p>
        </div>
        <Button variant="outline" onClick={() => alert('Próximamente')}>
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* Alert banner */}
      {sinStock > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">
            {sinStock} producto{sinStock !== 1 ? 's' : ''} sin stock
          </span>
          <span className="text-red-500 text-sm">— Revisa tu inventario y repón mercancía</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <p className="text-xs text-slate-500">Total productos</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
          <p className="text-xs text-slate-500">Sin stock</p>
          <p className="text-xl font-bold text-red-600 mt-1">{sinStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-amber-100">
          <p className="text-xs text-slate-500">Stock crítico (1-5)</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{critico}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
          <p className="text-xs text-slate-500">Stock bajo (6-10)</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{bajo}</p>
        </div>
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
        <button
          onClick={() => setOnlyProblems(prev => !prev)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            onlyProblems
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Solo con problemas
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay productos</p>
          <p className="text-slate-400 text-sm">Añade productos desde la sección Carta</p>
        </div>
      ) : (
        <>
          <StockTable
            products={products}
            onStockUpdated={updated =>
              setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
            }
          />
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
