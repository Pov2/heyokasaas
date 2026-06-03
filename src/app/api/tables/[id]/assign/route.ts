import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

  const { id: tableId } = await params

  const table = await prisma.restaurantTable.findFirst({ where: { id: tableId, businessId } })
  if (!table) {
    return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
  }

  const body = await request.json()
  const { orderId } = body

  const order = await prisma.order.findFirst({ where: { id: orderId, businessId } })
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { tableId },
  })

  return NextResponse.json(updated)
}

export async function PATCH(
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

  const { id: tableId } = await params

  // Unassign all active orders from this table
  await prisma.order.updateMany({
    where: {
      tableId,
      businessId,
      status: { notIn: ['DELIVERED', 'CANCELLED'] },
    },
    data: { tableId: null },
  })

  return NextResponse.json({ success: true })
}
