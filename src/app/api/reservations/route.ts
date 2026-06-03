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

  const dateParam = request.nextUrl.searchParams.get('date')
  const confirmedParam = request.nextUrl.searchParams.get('confirmed')
  const upcomingParam = request.nextUrl.searchParams.get('upcoming')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { businessId }

  if (dateParam) {
    const start = new Date(dateParam)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateParam)
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  } else if (upcomingParam === 'true') {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    where.date = { gte: now }
  }

  if (confirmedParam !== null && confirmedParam !== '') {
    where.confirmed = confirmedParam === 'true'
  }

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(reservations)
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
  const { name, phone, date, partySize, notes, confirmed } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }
  if (!date) {
    return NextResponse.json({ error: 'La fecha es obligatoria' }, { status: 400 })
  }
  const parsedPartySize = Number(partySize)
  if (!partySize || isNaN(parsedPartySize) || parsedPartySize < 1) {
    return NextResponse.json({ error: 'El número de comensales debe ser al menos 1' }, { status: 400 })
  }

  const reservation = await prisma.reservation.create({
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      date: new Date(date),
      partySize: parsedPartySize,
      notes: notes?.trim() || null,
      confirmed: confirmed === true || confirmed === 'true',
      businessId,
    },
  })

  return NextResponse.json(reservation, { status: 201 })
}
