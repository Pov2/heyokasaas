import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { BusinessType } from '@prisma/client'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessName, businessType, ownerName, email, password, city } = body

    if (!businessName || !businessType || !ownerName || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos obligatorios son requeridos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const validTypes = ['RESTAURANTE', 'BAR', 'TAKE_AWAY', 'HOTEL', 'CATERING', 'DARK_KITCHEN']
    if (!validTypes.includes(businessType)) {
      return NextResponse.json({ error: 'Tipo de negocio no válido' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate a unique slug
    const baseSlug = generateSlug(businessName)
    let slug = baseSlug
    let counter = 1
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          type: businessType as BusinessType,
          slug,
          city: city ?? null,
        },
      })

      await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
          role: 'OWNER',
          businessId: business.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
