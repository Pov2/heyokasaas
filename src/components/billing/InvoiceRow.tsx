'use client'

import Link from 'next/link'
import { ExternalLink, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'

interface InvoiceRowProps {
  order: Order
}

export function InvoiceRow({ order }: InvoiceRowProps) {
  const invoiceNumber = `FAC-${String(order.number).padStart(4, '0')}`
  const date = new Date(order.createdAt).toLocaleDateString('es-ES')
  const customerName = order.customer?.name ?? 'Sin cliente'
  const itemCount = order.items.length

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-700">{invoiceNumber}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{date}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{customerName}</td>
      <td className="px-4 py-3 text-sm text-slate-500 text-center">{itemCount}</td>
      <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">{order.total.toFixed(2)} €</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/facturacion/${order.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver detalle
            </Button>
          </Link>
          <Link href={`/facturacion/${order.id}?print=1`}>
            <Button size="sm" variant="ghost" className="gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}
