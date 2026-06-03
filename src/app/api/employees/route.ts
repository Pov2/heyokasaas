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
  const activeParam = request.nextUrl.searchParams.get('active')

  const employees = await prisma.employee.findMany({
    where: {
      businessId,
      ...(activeParam !== null && activeParam !== ''
        ? { active: activeParam === 'true' }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { position: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(employees)
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
  const { name, email, phone, position, salary, active } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const employee = await prisma.employee.create({
    data: {
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      position: position?.trim() || null,
      salary: salary != null && salary !== '' ? Number(salary) : null,
      active: active !== undefined ? Boolean(active) : true,
      businessId,
    },
  })

  return NextResponse.json(employee, { status: 201 })
}
