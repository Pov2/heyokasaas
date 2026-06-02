import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupplierDetailClient } from './SupplierDetailClient'

type Props = { params: Promise<{ id: string }> }

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const businessId = (session?.user as { businessId?: string })?.businessId

  if (!businessId) notFound()

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!supplier || supplier.businessId !== businessId) notFound()

  return (
    <div className="p-8">
      <Link
        href="/proveedores"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver a proveedores
      </Link>

      <SupplierDetailClient supplier={supplier} />
    </div>
  )
}
