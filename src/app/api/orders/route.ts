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

  const search = request.nextUrl.searchParams.get('search') ?? ''
  const status = request.nextUrl.searchParams.get('status') ?? ''
  const date = request.nextUrl.searchParams.get('date') ?? ''
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10)))

  const now = new Date()
  let dateFilter: { gte?: Date; lte?: Date } | undefined
  if (date === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    dateFilter = { gte: start, lte: end }
  } else if (date === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 7)
    dateFilter = { gte: start }
  }

  const where = {
    businessId,
    ...(status ? { status: status as never } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: 'insensitive' as const } } },
            ...(isNaN(Number(search)) ? [] : [{ number: Number(search) }]),
          ],
        }
      : {}),
  }

  const [orders, total] = await Promise.all([
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

  return NextResponse.json({
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const body = await request.json()
  const { customerId, notes, items, tableId } = body

  // Allow creating a draft order with no items (for table-based workflows)
  const itemsArray = Array.isArray(items) ? items : []
  if (itemsArray.length === 0 && !tableId) {
    return NextResponse.json({ error: 'El pedido debe tener al menos un artículo' }, { status: 400 })
  }

  const count = await prisma.order.count({ where: { businessId } })
  const number = count + 1
  const total = itemsArray.reduce((acc: number, item: { quantity: number; price: number }) => acc + item.quantity * item.price, 0)

  const order = await prisma.order.create({
    data: {
      number,
      total,
      notes: notes?.trim() || null,
      customerId: customerId || null,
      tableId: tableId || null,
      businessId,
      items: {
        create: itemsArray.map((item: { productId: string; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      },
    },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
