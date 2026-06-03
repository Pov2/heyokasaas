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

  const employee = await prisma.employee.findUnique({ where: { id } })

  if (!employee || employee.businessId !== businessId) {
    return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
  }

  return NextResponse.json(employee)
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

  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing || existing.businessId !== businessId) {
    return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { name, email, phone, position, salary, active } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: email?.trim() || null } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(position !== undefined ? { position: position?.trim() || null } : {}),
      ...(salary !== undefined ? { salary: salary != null && salary !== '' ? Number(salary) : null } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    },
  })

  return NextResponse.json(employee)
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

  const employee = await prisma.employee.findUnique({ where: { id } })

  if (!employee || employee.businessId !== businessId) {
    return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
  }

  await prisma.employee.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
