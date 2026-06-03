'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Receipt, Euro, ShoppingBag, BarChart2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { SummaryCard } from '@/components/billing/SummaryCard'
import { RevenueChart } from '@/components/billing/RevenueChart'
import { InvoiceRow } from '@/components/billing/InvoiceRow'
import type { Order } from '@/types'

interface Summary {
  currentRevenue: number
  previousRevenue: number
  currentCount: number
  revenueByDay: { date: string; total: number }[]
  topProducts: { name: string; revenue: number }[]
  topCustomers: { name: string; total: number }[]
}

interface BillingResponse {
  orders: Order[]
  aggregate: { total: number; count: number; avgTicket: number }
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function FacturacionContent() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [invoices, setInvoices] = useState<Order[]>([])
  const [aggregate, setAggregate] = useState({ total: 0, count: 0, avgTicket: 0 })
  const [month, setMonth] = useState(getCurrentMonth())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [paginationMeta, setPaginationMeta] = useState({ totalPages: 1 })
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingInvoices, setLoadingInvoices] = useState(true)

  useEffect(() => {
    setLoadingSummary(true)
    fetch('/api/billing/summary')
      .then(r => r.json())
      .then((data: Summary) => setSummary(data))
      .finally(() => setLoadingSummary(false))
  }, [])

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true)
    const params = new URLSearchParams({ month })
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '20')
    const res = await fetch(`/api/billing?${params.toString()}`)
    if (res.ok) {
      const data: BillingResponse = await res.json()
      setInvoices(data.orders)
      setAggregate(data.aggregate)
      setPaginationMeta({ totalPages: data.pagination.totalPages })
    }
    setLoadingInvoices(false)
  }, [month, search, page])

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, 300)
    return () => clearTimeout(timer)
  }, [fetchInvoices])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [month, search])

  const trendPct =
    summary && summary.previousRevenue > 0
      ? ((summary.currentRevenue - summary.previousRevenue) / summary.previousRevenue) * 100
      : undefined

  const formatEur = (n: number) =>
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €'

  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen financiero e historial de facturas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <SummaryCard
          label="Ingresos este mes"
          value={loadingSummary ? '...' : formatEur(summary?.currentRevenue ?? 0)}
          icon={Euro}
        />
        <SummaryCard
          label="Tickets este mes"
          value={loadingSummary ? '...' : (summary?.currentCount ?? 0)}
          icon={Receipt}
        />
        <SummaryCard
          label="Ticket medio"
          value={
            loadingSummary
              ? '...'
              : formatEur(
                  summary && summary.currentCount > 0
                    ? summary.currentRevenue / summary.currentCount
                    : 0
                )
          }
          icon={ShoppingBag}
        />
        <SummaryCard
          label="Variación vs anterior"
          value={
            loadingSummary
              ? '...'
              : trendPct !== undefined
              ? `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}%`
              : 'N/A'
          }
          trend={trendPct}
          trendLabel={
            trendPct !== undefined ? `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}%` : undefined
          }
          icon={BarChart2}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 print:hidden">
        <h2 className="font-semibold text-slate-700 mb-6">Ingresos diarios — mes actual</h2>
        {loadingSummary ? (
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Cargando...</div>
        ) : (
          <RevenueChart data={summary?.revenueByDay ?? []} />
        )}
      </div>

      {/* Top lists */}
      {!loadingSummary && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Top 5 productos más vendidos</h2>
            {summary.topProducts.length === 0 ? (
              <p className="text-sm text-slate-400">Sin datos este mes</p>
            ) : (
              <ul className="space-y-3">
                {summary.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700 truncate">{p.name}</span>
                    <span className="text-sm font-bold text-green-700">{formatEur(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Top 5 clientes por gasto</h2>
            {summary.topCustomers.length === 0 ? (
              <p className="text-sm text-slate-400">Sin datos este mes</p>
            ) : (
              <ul className="space-y-3">
                {summary.topCustomers.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700 truncate">{c.name}</span>
                    <span className="text-sm font-bold text-green-700">{formatEur(c.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Invoice Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center print:hidden">
          <h2 className="font-semibold text-slate-700 flex-1 min-w-[120px]">Facturas emitidas</h2>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar cliente o número..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loadingInvoices ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando facturas...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay facturas para este período</p>
            <p className="text-slate-400 text-sm">Solo se muestran pedidos entregados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Factura #</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Cliente</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-center">Items</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right print:hidden">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(order => (
                  <InvoiceRow key={order.id} order={order} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={4} className="px-4 py-3 font-bold text-slate-700 text-right">
                    Total ({aggregate.count} facturas)
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700 text-right text-base">
                    {formatEur(aggregate.total)}
                  </td>
                  <td className="print:hidden" />
                </tr>
              </tfoot>
            </table>
            <Pagination page={page} totalPages={paginationMeta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
