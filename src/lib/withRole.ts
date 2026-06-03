import { auth } from './auth'
import { NextResponse } from 'next/server'
import { canAccess, type UserRole } from './permissions'

export async function requireRole(module: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  const role = (session.user as any).role as string
  if (!canAccess(role as UserRole, module)) {
    return { error: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
  }
  const businessId = (session.user as any).businessId as string
  return { session, role, businessId }
}
