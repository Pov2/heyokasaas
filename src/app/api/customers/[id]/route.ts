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

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!customer || customer.businessId !== businessId) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  return NextResponse.json(customer)
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

  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing || existing.businessId !== businessId) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { name, email, phone, address, notes } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return NextResponse.json(customer)
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

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  })

  if (!customer || customer.businessId !== businessId) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  if (customer._count.orders > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un cliente con pedidos asociados' },
      { status: 400 }
    )
  }

  await prisma.customer.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
