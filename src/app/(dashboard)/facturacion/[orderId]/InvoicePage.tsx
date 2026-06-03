'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface InvoiceItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    unit: string
    vatRate: number
  }
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  business: {
    name: string
    address?: string | null
    city?: string | null
    email?: string | null
    phone?: string | null
  }
  customer?: {
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
  } | null
  items: InvoiceItem[]
  total: number
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €'
}

export default function InvoicePage({ data }: { data: InvoiceData }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('print') === '1') {
      window.print()
    }
  }, [searchParams])

  // Compute IVA breakdown grouped by vatRate
  const vatGroups: Record<number, { base: number; iva: number }> = {}
  for (const item of data.items) {
    const lineTotal = item.price * item.quantity
    const rate = item.product.vatRate
    const base = lineTotal / (1 + rate / 100)
    const iva = lineTotal - base
    if (!vatGroups[rate]) vatGroups[rate] = { base: 0, iva: 0 }
    vatGroups[rate].base += base
    vatGroups[rate].iva += iva
  }

  const sortedRates = Object.keys(vatGroups).map(Number).sort((a, b) => a - b)
  const totalBase = sortedRates.reduce((s, r) => s + vatGroups[r].base, 0)
  const totalIva = sortedRates.reduce((s, r) => s + vatGroups[r].iva, 0)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print p-4 border-b border-slate-100 bg-white flex items-center gap-3">
        <Link href="/facturacion">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
      </div>

      <div className="max-w-2xl mx-auto p-8 bg-white print:p-6 print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.business.name}</h1>
            {data.business.address && (
              <p className="text-sm text-slate-500 mt-1">{data.business.address}{data.business.city ? `, ${data.business.city}` : ''}</p>
            )}
            <p className="text-sm text-slate-500 mt-0.5">
              {[data.business.email, data.business.phone].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold font-mono text-slate-900">{data.invoiceNumber}</p>
            <p className="text-sm text-slate-500 mt-1">{data.date}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-6" />

        {/* Customer */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cliente</p>
          {data.customer ? (
            <div className="text-sm text-slate-700">
              <p className="font-semibold">{data.customer.name}</p>
              {data.customer.phone && <p className="text-slate-500">{data.customer.phone}</p>}
              {data.customer.email && <p className="text-slate-500">{data.customer.email}</p>}
              {data.customer.address && <p className="text-slate-500">{data.customer.address}</p>}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Sin cliente registrado</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-6" />

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-2 font-semibold text-slate-600">Producto</th>
              <th className="text-right py-2 font-semibold text-slate-600">Cant.</th>
              <th className="text-right py-2 font-semibold text-slate-600">IVA%</th>
              <th className="text-right py-2 font-semibold text-slate-600">Precio</th>
              <th className="text-right py-2 font-semibold text-slate-600">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2.5 text-slate-800">{item.product.name}</td>
                <td className="py-2.5 text-right text-slate-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-slate-500">{item.product.vatRate}%</td>
                <td className="py-2.5 text-right text-slate-700">{formatEur(item.price)}</td>
                <td className="py-2.5 text-right font-medium text-slate-900">{formatEur(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* IVA breakdown + totals */}
        <div className="flex justify-end">
          <div className="min-w-[280px] space-y-1 text-sm">
            {sortedRates.map((rate) => (
              <div key={rate} className="text-slate-500 space-y-0.5">
                <div className="flex justify-between gap-8">
                  <span>Base imponible al {rate}%</span>
                  <span>{formatEur(vatGroups[rate].base)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span>IVA ({rate}%)</span>
                  <span>{formatEur(vatGroups[rate].iva)}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 mt-2" />
            <div className="flex justify-between gap-8 text-slate-500">
              <span>Base imponible total</span>
              <span>{formatEur(totalBase)}</span>
            </div>
            <div className="flex justify-between gap-8 text-slate-500">
              <span>IVA total</span>
              <span>{formatEur(totalIva)}</span>
            </div>
            <div className="border-t-2 border-slate-800 pt-2 mt-1 flex justify-between gap-8 font-bold text-lg text-slate-900">
              <span>TOTAL</span>
              <span>{formatEur(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
