import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
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

  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 })
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status] ?? []
  if (!allowedTransitions.includes(status)) {
    return NextResponse.json(
      { error: `No se puede cambiar de ${order.status} a ${status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  })

  return NextResponse.json(updated)
}
