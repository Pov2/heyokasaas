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
  const cashSession = await prisma.cashSession.findFirst({
    where: { id, businessId },
  })
  if (!cashSession) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  const movements = await prisma.cashMovement.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(movements)
}

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

  const { id } = await params
  const cashSession = await prisma.cashSession.findFirst({
    where: { id, businessId, status: 'OPEN' },
  })
  if (!cashSession) {
    return NextResponse.json({ error: 'Sesión no encontrada o cerrada' }, { status: 404 })
  }

  const body = await request.json()
  const { type, amount, paymentMethod, description, orderId } = body

  if (!type || !amount || !paymentMethod) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const movement = await prisma.cashMovement.create({
    data: {
      type,
      amount: Number(amount),
      paymentMethod,
      description: description?.trim() || null,
      orderId: orderId || null,
      sessionId: id,
    },
  })

  return NextResponse.json(movement, { status: 201 })
}
