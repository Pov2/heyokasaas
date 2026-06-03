import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const deliveredWhere = (gte: Date, lt: Date) => ({
    businessId,
    status: 'DELIVERED' as const,
    createdAt: { gte, lt },
  })

  const [thisMonthOrders, prevMonthOrders] = await Promise.all([
    prisma.order.findMany({
      where: deliveredWhere(thisMonthStart, nextMonthStart),
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.order.findMany({
      where: deliveredWhere(prevMonthStart, thisMonthStart),
      select: { total: true },
    }),
  ])

  const currentRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0)
  const previousRevenue = prevMonthOrders.reduce((s, o) => s + o.total, 0)
  const currentCount = thisMonthOrders.length

  // Revenue by day for current month
  const revenueByDayMap: Record<string, number> = {}
  for (const order of thisMonthOrders) {
    const d = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    revenueByDayMap[key] = (revenueByDayMap[key] ?? 0) + order.total
  }
  const revenueByDay = Object.entries(revenueByDayMap)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Top 5 products by revenue
  const productMap: Record<string, { name: string; revenue: number }> = {}
  for (const order of thisMonthOrders) {
    for (const item of order.items) {
      const id = item.productId
      if (!productMap[id]) productMap[id] = { name: item.product.name, revenue: 0 }
      productMap[id].revenue += item.quantity * item.price
    }
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top 5 customers by spend
  const customerMap: Record<string, { name: string; total: number }> = {}
  for (const order of thisMonthOrders) {
    if (!order.customer) continue
    const id = order.customer.id
    if (!customerMap[id]) customerMap[id] = { name: order.customer.name, total: 0 }
    customerMap[id].total += order.total
  }
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return NextResponse.json({
    currentRevenue,
    previousRevenue,
    currentCount,
    revenueByDay,
    topProducts,
    topCustomers,
  })
}
