import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name: name.trim() },
  })

  return NextResponse.json(category, { status: 201 })
}
