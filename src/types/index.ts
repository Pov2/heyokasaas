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

export type Supplier = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  category?: string | null
  notes?: string | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count?: { products: number }
}
