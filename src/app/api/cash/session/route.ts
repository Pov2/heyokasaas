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

  const cashSession = await prisma.cashSession.findFirst({
    where: { businessId, status: 'OPEN' },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!cashSession) {
    return NextResponse.json(null)
  }

  // compute totals by payment method
  const totals = { CASH: 0, CARD: 0, BIZUM: 0, OTHER: 0 }
  for (const m of cashSession.movements) {
    const sign = m.type === 'OUT' || m.type === 'REFUND' ? -1 : 1
    totals[m.paymentMethod as keyof typeof totals] += sign * m.amount
  }

  return NextResponse.json({ ...cashSession, totals })
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

  const existing = await prisma.cashSession.findFirst({
    where: { businessId, status: 'OPEN' },
  })
  if (existing) {
    return NextResponse.json({ error: 'Ya hay una caja abierta' }, { status: 400 })
  }

  const body = await request.json()
  const openingBalance = Number(body.openingBalance ?? 0)

  const cashSession = await prisma.cashSession.create({
    data: { businessId, openingBalance, status: 'OPEN' },
    include: { movements: true },
  })

  return NextResponse.json(cashSession, { status: 201 })
}
