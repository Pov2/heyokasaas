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

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!supplier || supplier.businessId !== businessId) {
    return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
  }

  return NextResponse.json(supplier)
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

  const existing = await prisma.supplier.findUnique({ where: { id } })
  if (!existing || existing.businessId !== businessId) {
    return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { name, email, phone, address, category, notes } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      category: category?.trim() || null,
      notes: notes?.trim() || null,
    },
    include: {
      _count: { select: { products: true } },
    },
  })

  return NextResponse.json(supplier)
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

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })

  if (!supplier || supplier.businessId !== businessId) {
    return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
  }

  if (supplier._count.products > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un proveedor con productos asociados' },
      { status: 400 }
    )
  }

  await prisma.supplier.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
