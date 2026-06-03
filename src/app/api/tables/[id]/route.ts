import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const table = await prisma.restaurantTable.findFirst({
    where: { id, businessId },
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

  if (!table) {
    return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    ...table,
    currentOrder: table.orders[0] ?? null,
    orders: undefined,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { number, name, capacity, posX, posY, active } = body

  const table = await prisma.restaurantTable.findFirst({ where: { id, businessId } })
  if (!table) {
    return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
  }

  const updated = await prisma.restaurantTable.update({
    where: { id },
    data: {
      ...(number !== undefined && { number: Number(number) }),
      ...(name !== undefined && { name }),
      ...(capacity !== undefined && { capacity: Number(capacity) }),
      ...(posX !== undefined && { posX: Number(posX) }),
      ...(posY !== undefined && { posY: Number(posY) }),
      ...(active !== undefined && { active }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const table = await prisma.restaurantTable.findFirst({ where: { id, businessId } })
  if (!table) {
    return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
  }

  const activeOrders = await prisma.order.count({
    where: {
      tableId: id,
      status: { notIn: ['DELIVERED', 'CANCELLED'] },
    },
  })

  if (activeOrders > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar una mesa con pedidos activos' },
      { status: 409 }
    )
  }

  await prisma.restaurantTable.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
