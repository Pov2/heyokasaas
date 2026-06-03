import { NextRequest, NextResponse } from 'next/server'
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

  const tables = await prisma.restaurantTable.findMany({
    where: { businessId },
    orderBy: { number: 'asc' },
    include: {
      orders: {
        where: {
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
    },
  })

  const result = tables.map((t) => ({
    ...t,
    currentOrder: t.orders[0] ?? null,
    orders: undefined,
  }))

  return NextResponse.json(result)
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
  const { number, name, capacity, posX, posY } = body

  if (!number || !capacity) {
    return NextResponse.json({ error: 'Número y capacidad son requeridos' }, { status: 400 })
  }

  const table = await prisma.restaurantTable.create({
    data: {
      number: Number(number),
      name: name ?? null,
      capacity: Number(capacity),
      posX: posX ?? 0,
      posY: posY ?? 0,
      businessId,
    },
  })

  return NextResponse.json(table, { status: 201 })
}
