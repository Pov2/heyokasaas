export type Customer = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  notes?: string | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count?: { orders: number }
}
