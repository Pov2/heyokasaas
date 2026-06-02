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

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      _count: { select: { orderItems: true } },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              number: true,
              status: true,
              total: true,
              createdAt: true,
            },
          },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 20,
      },
    },
  })

  if (!product || product.businessId !== businessId) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json(product)
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

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing || existing.businessId !== businessId) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { name, description, price, cost, stock, unit, active, categoryId, supplierId } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(cost !== undefined ? { cost: cost !== '' && cost !== null ? Number(cost) : null } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
      ...(unit !== undefined ? { unit } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
      ...(supplierId !== undefined ? { supplierId: supplierId || null } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      _count: { select: { orderItems: true } },
    },
  })

  return NextResponse.json(product)
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

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  })

  if (!product || product.businessId !== businessId) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  if (product._count.orderItems > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un producto que tiene pedidos asociados' },
      { status: 400 }
    )
  }

  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
