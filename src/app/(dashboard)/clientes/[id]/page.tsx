import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CustomerDetailClient } from './CustomerDetailClient'

type Props = { params: Promise<{ id: string }> }

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const businessId = (session?.user as { businessId?: string })?.businessId

  if (!businessId) notFound()

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!customer || customer.businessId !== businessId) notFound()

  return (
    <div className="p-8">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver a clientes
      </Link>

      <CustomerDetailClient customer={customer} />
    </div>
  )
}
