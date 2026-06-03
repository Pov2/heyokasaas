import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) redirect('/login')

  const product = await prisma.product.findFirst({
    where: { id, businessId },
    include: {
      category: true,
      supplier: { select: { id: true, name: true } },
      orderItems: {
        include: {
          order: { select: { id: true, number: true, status: true, createdAt: true } },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 20,
      },
    },
  })

  if (!product) notFound()

  return <ProductDetailClient product={product as any} />
}
