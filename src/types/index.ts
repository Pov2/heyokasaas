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

export type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  cost?: number | null
  stock: number
  unit: string
  active: boolean
  vatRate: number
  categoryId?: string | null
  category?: { id: string; name: string } | null
  supplierId?: string | null
  supplier?: { id: string; name: string } | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count?: { orderItems: number }
}

export type Category = {
  id: string
  name: string
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'

export type OrderItem = {
  id: string
  quantity: number
  price: number
  productId: string
  product: { id: string; name: string; unit: string }
  orderId: string
}

export type Order = {
  id: string
  number: number
  status: OrderStatus
  total: number
  notes?: string | null
  customerId?: string | null
  customer?: { id: string; name: string } | null
  businessId: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export type Employee = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  position?: string | null
  salary?: number | null
  active: boolean
  businessId: string
  createdAt: Date
  updatedAt: Date
}

export type Reservation = {
  id: string
  name: string
  phone?: string | null
  date: Date | string
  partySize: number
  notes?: string | null
  confirmed: boolean
  businessId: string
  createdAt: Date
  updatedAt: Date
}

export type CashMovement = {
  id: string
  type: 'SALE' | 'REFUND' | 'IN' | 'OUT'
  amount: number
  paymentMethod: 'CASH' | 'CARD' | 'BIZUM' | 'OTHER'
  description?: string | null
  orderId?: string | null
  sessionId: string
  createdAt: Date
}

export type CashSession = {
  id: string
  openedAt: Date
  closedAt?: Date | null
  openingBalance: number
  closingBalance?: number | null
  status: 'OPEN' | 'CLOSED'
  notes?: string | null
  businessId: string
  movements: CashMovement[]
  createdAt: Date
  updatedAt: Date
}

export type RestaurantTable = {
  id: string
  number: number
  name?: string | null
  capacity: number
  posX: number
  posY: number
  active: boolean
  businessId: string
  createdAt: Date
  updatedAt: Date
  currentOrder?: {
    id: string
    number: number
    status: string
    total: number
    createdAt: Date
  } | null
}
