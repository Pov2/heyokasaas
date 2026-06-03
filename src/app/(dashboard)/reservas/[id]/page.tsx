import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReservationDetailClient } from './ReservationDetailClient'

type Props = { params: Promise<{ id: string }> }

export default async function ReservationDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const businessId = (session?.user as { businessId?: string })?.businessId

  if (!businessId) notFound()

  const reservation = await prisma.reservation.findFirst({
    where: { id, businessId },
  })

  if (!reservation) notFound()

  return (
    <div className="p-8">
      <Link
        href="/reservas"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver a reservas
      </Link>

      <ReservationDetailClient reservation={reservation} />
    </div>
  )
}
