import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderDetailClient from './OrderDetailClient'

type PageProps = { params: Promise<{ id: string }> }

export default async function PedidoDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  const businessId = (session?.user as { businessId?: string })?.businessId

  if (!businessId) notFound()

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  })

  if (!order || order.businessId !== businessId) notFound()

  return <OrderDetailClient order={order as never} />
}
