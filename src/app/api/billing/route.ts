import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/withRole'

export async function GET(request: NextRequest) {
  const result = await requireRole('facturacion')
  if ('error' in result) return result.error

  const { businessId } = result

  const month = request.nextUrl.searchParams.get('month') ?? ''
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const customerId = request.nextUrl.searchParams.get('customerId') ?? ''
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10)))

  let dateFilter: { gte?: Date; lt?: Date } | undefined
  if (month) {
    const [year, mon] = month.split('-').map(Number)
    dateFilter = {
      gte: new Date(year, mon - 1, 1),
      lt: new Date(year, mon, 1),
    }
  }

  const where = {
    businessId,
    status: 'DELIVERED' as const,
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(customerId ? { customerId } : {}),
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: 'insensitive' as const } } },
            ...(isNaN(Number(search)) ? [] : [{ number: Number(search) }]),
          ],
        }
      : {}),
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  // Aggregate totals over the full filtered set (not just current page)
  const allOrders = await prisma.order.aggregate({
    where,
    _sum: { total: true },
    _count: { id: true },
  })

  const totalRevenue = allOrders._sum.total ?? 0
  const count = allOrders._count.id
  const avgTicket = count > 0 ? totalRevenue / count : 0

  return NextResponse.json({
    orders,
    aggregate: { total: totalRevenue, count, avgTicket },
    pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
  })
}
