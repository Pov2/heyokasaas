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

  const search = request.nextUrl.searchParams.get('search') ?? ''
  const categoryId = request.nextUrl.searchParams.get('category') ?? ''
  const activeParam = request.nextUrl.searchParams.get('active')

  const products = await prisma.product.findMany({
    where: {
      businessId,
      ...(categoryId ? { categoryId } : {}),
      ...(activeParam !== null ? { active: activeParam === 'true' } : {}),
      ...(search
        ? {
            name: { contains: search, mode: 'insensitive' },
          }
        : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
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
  const { name, description, price, cost, stock, unit, active, categoryId, supplierId } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }
  if (price === undefined || price === null || isNaN(Number(price))) {
    return NextResponse.json({ error: 'El precio es obligatorio' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      cost: cost !== undefined && cost !== '' && cost !== null ? Number(cost) : null,
      stock: stock !== undefined ? Number(stock) : 0,
      unit: unit || 'ud',
      active: active !== undefined ? Boolean(active) : true,
      categoryId: categoryId || null,
      supplierId: supplierId || null,
      businessId,
    },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      _count: { select: { orderItems: true } },
    },
  })

  return NextResponse.json(product, { status: 201 })
}
