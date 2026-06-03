import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const reservation = await prisma.reservation.findFirst({
    where: { id, businessId },
  })

  if (!reservation) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  return NextResponse.json(reservation)
}

export async function PUT(request: NextRequest, { params }: Params) {
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
  const { name, phone, date, partySize, notes, confirmed } = body

  const existing = await prisma.reservation.findFirst({ where: { id, businessId } })
  if (!existing) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {}
  if (name !== undefined) data.name = name.trim()
  if (phone !== undefined) data.phone = phone?.trim() || null
  if (date !== undefined) data.date = new Date(date)
  if (partySize !== undefined) data.partySize = Number(partySize)
  if (notes !== undefined) data.notes = notes?.trim() || null
  if (confirmed !== undefined) data.confirmed = confirmed === true || confirmed === 'true'

  const reservation = await prisma.reservation.update({
    where: { id },
    data,
  })

  return NextResponse.json(reservation)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.reservation.findFirst({ where: { id, businessId } })
  if (!existing) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  await prisma.reservation.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
