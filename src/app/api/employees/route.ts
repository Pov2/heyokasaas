import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/withRole'

export async function GET(request: NextRequest) {
  const result = await requireRole('empleados')
  if ('error' in result) return result.error

  const { businessId } = result

  const search = request.nextUrl.searchParams.get('search') ?? ''
  const activeParam = request.nextUrl.searchParams.get('active')
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10)))

  const where = {
    businessId,
    ...(activeParam !== null && activeParam !== '' ? { active: activeParam === 'true' } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { position: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ])

  return NextResponse.json({
    data: employees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const result = await requireRole('empleados')
  if ('error' in result) return result.error

  const { businessId } = result

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
