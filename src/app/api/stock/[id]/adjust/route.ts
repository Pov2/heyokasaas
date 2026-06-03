import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const businessId = (session.user as { businessId?: string }).businessId
  if (!businessId) {
    return NextResponse.json({ error: 'Sin negocio asociado' }, { status: 403 })
  }

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.businessId !== businessId) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { delta } = body

  if (delta === undefined || isNaN(Number(delta))) {
    return NextResponse.json({ error: 'El delta es obligatorio y debe ser un número' }, { status: 400 })
  }

  const newStock = product.stock + Number(delta)
  if (newStock < 0) {
    return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 })
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { stock: newStock },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(updated)
}
