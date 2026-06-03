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
    include: {
      movements: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!cashSession) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  return NextResponse.json(cashSession)
}

export async function PATCH(
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
  const closingBalance = Number(body.closingBalance ?? 0)
  const notes = body.notes?.trim() || null

  const cashSession = await prisma.cashSession.updateMany({
    where: { id, businessId, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date(), closingBalance, notes },
  })

  if (cashSession.count === 0) {
    return NextResponse.json({ error: 'Sesión no encontrada o ya cerrada' }, { status: 404 })
  }

  const updated = await prisma.cashSession.findUnique({
    where: { id },
    include: { movements: { orderBy: { createdAt: 'desc' } } },
  })

  return NextResponse.json(updated)
}
