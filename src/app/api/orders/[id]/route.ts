import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

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

  if (!order || order.businessId !== businessId) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing || existing.businessId !== businessId) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { status, notes, customerId, items } = body

  let total = existing.total
  if (items && Array.isArray(items) && items.length > 0) {
    total = items.reduce((acc: number, item: { quantity: number; price: number }) => acc + item.quantity * item.price, 0)
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
      ...(customerId !== undefined ? { customerId: customerId || null } : {}),
      ...(items && Array.isArray(items) && items.length > 0
        ? {
            total,
            items: {
              create: items.map((item: { productId: string; quantity: number; price: number }) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                price: Number(item.price),
              })),
            },
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
  })

  return NextResponse.json(order)
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order || order.businessId !== businessId) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
    return NextResponse.json(
      { error: 'Solo se pueden eliminar pedidos en estado Pendiente o Cancelado' },
      { status: 400 }
    )
  }

  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
