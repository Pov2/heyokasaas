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
  const low = request.nextUrl.searchParams.get('low') === 'true'

  const products = await prisma.product.findMany({
    where: {
      businessId,
      ...(categoryId ? { categoryId } : {}),
      ...(low ? { stock: { lte: 10 } } : {}),
      ...(search
        ? { name: { contains: search, mode: 'insensitive' } }
        : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { stock: 'asc' },
  })

  return NextResponse.json(products)
}
