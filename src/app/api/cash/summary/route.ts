import { NextResponse } from 'next/server'
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

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  // Current open session
  const openSession = await prisma.cashSession.findFirst({
    where: { businessId, status: 'OPEN' },
    select: { id: true, openedAt: true, openingBalance: true, status: true },
  })

  // Today's movements (across all sessions of this business)
  const todayMovements = await prisma.cashMovement.findMany({
    where: {
      session: { businessId },
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
    select: { type: true, amount: true, paymentMethod: true },
  })

  const totals = { cash: 0, card: 0, bizum: 0, other: 0 }
  let totalRevenue = 0

  for (const m of todayMovements) {
    const sign = m.type === 'OUT' || m.type === 'REFUND' ? -1 : 1
    const value = sign * m.amount
    totalRevenue += value
    if (m.paymentMethod === 'CASH') totals.cash += value
    else if (m.paymentMethod === 'CARD') totals.card += value
    else if (m.paymentMethod === 'BIZUM') totals.bizum += value
    else totals.other += value
  }

  return NextResponse.json({
    currentSession: openSession,
    sessionStatus: openSession ? 'OPEN' : 'NONE',
    totals,
    totalRevenue,
    movementCount: todayMovements.length,
  })
}
