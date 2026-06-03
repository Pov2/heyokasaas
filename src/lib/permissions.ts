export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF'

export const ROLE_PERMISSIONS = {
  OWNER: ['*'],
  ADMIN: ['dashboard', 'clientes', 'proveedores', 'carta', 'pedidos', 'stock', 'empleados', 'reservas', 'facturacion', 'caja', 'mesas'],
  MANAGER: ['dashboard', 'clientes', 'proveedores', 'carta', 'pedidos', 'stock', 'reservas', 'mesas'],
  STAFF: ['dashboard', 'pedidos', 'carta', 'mesas'],
} as const

export function canAccess(role: UserRole, module: string): boolean {
  const perms = ROLE_PERMISSIONS[role]
  return perms.includes('*' as never) || perms.includes(module as never)
}
