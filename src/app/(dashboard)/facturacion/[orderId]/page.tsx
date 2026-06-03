import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import InvoicePage from './InvoicePage'

type PageProps = { params: Promise<{ orderId: string }> }

export default async function InvoicePageRoute({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) redirect('/login')

  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: { id: true, name: true, unit: true, vatRate: true },
          },
        },
      },
    },
  })

  if (!order || order.businessId !== businessId || order.status !== 'DELIVERED') {
    notFound()
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, address: true, city: true, email: true, phone: true },
  })

  if (!business) notFound()

  // Get or create invoice sequence for this year
  const year = new Date(order.createdAt).getFullYear()

  const sequence = await prisma.invoiceSequence.upsert({
    where: { businessId_year: { businessId, year } },
    create: { businessId, year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  })

  const invoiceNumber = `FAC-${year}-${String(sequence.lastNumber).padStart(4, '0')}`

  const date = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <InvoicePage
      data={{
        invoiceNumber,
        date,
        business,
        customer: order.customer
          ? {
              name: order.customer.name,
              phone: order.customer.phone,
              email: order.customer.email,
              address: order.customer.address,
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            unit: item.product.unit,
            vatRate: item.product.vatRate,
          },
        })),
        total: order.total,
      }}
    />
  )
}
