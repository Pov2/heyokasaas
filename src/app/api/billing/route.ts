import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const month = request.nextUrl.searchParams.get('month') ?? ''
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const customerId = request.nextUrl.searchParams.get('customerId') ?? ''

  let dateFilter: { gte?: Date; lt?: Date } | undefined
  if (month) {
    const [year, mon] = month.split('-').map(Number)
    dateFilter = {
      gte: new Date(year, mon - 1, 1),
      lt: new Date(year, mon, 1),
    }
  }

  const orders = await prisma.order.findMany({
    where: {
      businessId,
      status: 'DELIVERED',
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search
        ? {
            OR: [
              { customer: { name: { contains: search, mode: 'insensitive' } } },
              ...(isNaN(Number(search)) ? [] : [{ number: Number(search) }]),
            ],
          }
        : {}),
    },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = orders.reduce((sum, o) => sum + o.total, 0)
  const count = orders.length
  const avgTicket = count > 0 ? total / count : 0

  return NextResponse.json({ orders, aggregate: { total, count, avgTicket } })
}
