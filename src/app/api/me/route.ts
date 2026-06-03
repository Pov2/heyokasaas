import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = session.user as any
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    businessName: user.businessName,
    businessType: user.businessType,
  })
}
