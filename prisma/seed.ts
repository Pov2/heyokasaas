import { PrismaClient, BusinessType, UserRole, OrderStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/heyoka'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Business
  const business = await prisma.business.upsert({
    where: { slug: 'el-rincon' },
    update: {},
    create: {
      name: 'Restaurante El Rincón',
      type: BusinessType.RESTAURANTE,
      slug: 'el-rincon',
      phone: '912345678',
      address: 'Calle Mayor 15',
      city: 'Madrid',
      email: 'info@elrincon.es',
    },
  })
  console.log('Business created:', business.name)

  // 2. Owner user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'admin@elrincon.es' },
    update: {},
    create: {
      name: 'Carlos García',
      email: 'admin@elrincon.es',
      password: hashedPassword,
      role: UserRole.OWNER,
      businessId: business.id,
    },
  })
  console.log('Owner created:', owner.email)

  // 3. Categories
  const [catEntrantes, catPrincipales, catPostres, catBebidas] = await Promise.all([
    prisma.category.create({ data: { name: 'Entrantes' } }),
    prisma.category.create({ data: { name: 'Platos principales' } }),
    prisma.category.create({ data: { name: 'Postres' } }),
    prisma.category.create({ data: { name: 'Bebidas' } }),
  ])
  console.log('Categories created')

  // 4. Suppliers
  const [supplierCarnes, supplierFrutas, supplierBebidas] = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Carnes Martínez',
        email: 'pedidos@carnesmartinez.es',
        phone: '913456789',
        category: 'Carnes',
        businessId: business.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Frutas García',
        email: 'pedidos@frutasgarcia.es',
        phone: '914567890',
        category: 'Frutas y Verduras',
        businessId: business.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Distribuciones López',
        email: 'pedidos@distlopez.es',
        phone: '915678901',
        category: 'Bebidas',
        businessId: business.id,
      },
    }),
  ])
  console.log('Suppliers created')

  // 5. Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Jamón ibérico',
        description: 'Jamón ibérico de bellota cortado a mano',
        price: 18.5,
        cost: 9.0,
        stock: 25,
        unit: 'ración',
        categoryId: catEntrantes.id,
        supplierId: supplierCarnes.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Croquetas caseras',
        description: 'Croquetas de jamón y bechamel',
        price: 9.0,
        cost: 3.5,
        stock: 40,
        unit: 'ración',
        categoryId: catEntrantes.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Entrecot de ternera',
        description: 'Entrecot 300g a la plancha con patatas',
        price: 24.0,
        cost: 12.0,
        stock: 15,
        unit: 'plato',
        categoryId: catPrincipales.id,
        supplierId: supplierCarnes.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Paella valenciana',
        description: 'Paella para dos personas con pollo y conejo',
        price: 28.0,
        cost: 10.0,
        stock: 8,
        unit: 'plato',
        categoryId: catPrincipales.id,
        supplierId: supplierFrutas.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Merluza a la romana',
        description: 'Merluza rebozada con alioli',
        price: 16.5,
        cost: 7.0,
        stock: 3,
        unit: 'plato',
        categoryId: catPrincipales.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Tarta de queso',
        description: 'Tarta de queso estilo La Viña',
        price: 7.0,
        cost: 2.5,
        stock: 12,
        unit: 'porción',
        categoryId: catPostres.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vino tinto Rioja',
        description: 'Botella Rioja Reserva 75cl',
        price: 18.0,
        cost: 8.0,
        stock: 5,
        unit: 'botella',
        categoryId: catBebidas.id,
        supplierId: supplierBebidas.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Agua mineral',
        description: 'Botella de agua mineral 50cl',
        price: 2.0,
        cost: 0.5,
        stock: 80,
        unit: 'botella',
        categoryId: catBebidas.id,
        supplierId: supplierBebidas.id,
        businessId: business.id,
      },
    }),
  ])
  console.log('Products created:', products.length)

  // 6. Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'María López',
        email: 'maria.lopez@email.es',
        phone: '620111222',
        businessId: business.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.es',
        phone: '630222333',
        businessId: business.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ana Fernández',
        email: 'ana.fernandez@email.es',
        phone: '640333444',
        businessId: business.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@email.es',
        phone: '650444555',
        businessId: business.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Laura Martín',
        email: 'laura.martin@email.es',
        phone: '660555666',
        businessId: business.id,
      },
    }),
  ])
  console.log('Customers created:', customers.length)

  // 7. Employees
  await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Miguel Torres',
        email: 'miguel.torres@elrincon.es',
        phone: '611100200',
        position: 'Jefe de cocina',
        salary: 2800,
        active: true,
        businessId: business.id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Carmen Ruiz',
        email: 'carmen.ruiz@elrincon.es',
        phone: '611200300',
        position: 'Cocinera',
        salary: 1900,
        active: true,
        businessId: business.id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Roberto Gómez',
        email: 'roberto.gomez@elrincon.es',
        phone: '611300400',
        position: 'Camarero',
        salary: 1700,
        active: true,
        businessId: business.id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Isabel Castro',
        email: 'isabel.castro@elrincon.es',
        phone: '611400500',
        position: 'Jefa de sala',
        salary: 2100,
        active: true,
        businessId: business.id,
      },
    }),
  ])
  console.log('Employees created')

  // 8. Reservations (today and tomorrow)
  const todayNoon = new Date()
  todayNoon.setHours(13, 30, 0, 0)
  const todayEvening = new Date()
  todayEvening.setHours(21, 0, 0, 0)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  await Promise.all([
    prisma.reservation.create({
      data: {
        name: 'Familia López',
        phone: '620111222',
        date: todayNoon,
        partySize: 4,
        notes: 'Mesa junto a la ventana',
        confirmed: true,
        businessId: business.id,
      },
    }),
    prisma.reservation.create({
      data: {
        name: 'Juan Pérez',
        phone: '630222333',
        date: todayEvening,
        partySize: 2,
        confirmed: true,
        businessId: business.id,
      },
    }),
    prisma.reservation.create({
      data: {
        name: 'Empresa ABC',
        phone: '917654321',
        date: tomorrow,
        partySize: 10,
        notes: 'Menú cerrado para grupo de empresa',
        confirmed: false,
        businessId: business.id,
      },
    }),
  ])
  console.log('Reservations created')

  // 9. Orders
  const order1 = await prisma.order.create({
    data: {
      number: 1,
      status: OrderStatus.DELIVERED,
      total: 60.0,
      customerId: customers[0].id,
      businessId: business.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      items: {
        create: [
          { quantity: 2, price: products[0].price, productId: products[0].id },
          { quantity: 1, price: products[2].price, productId: products[2].id },
          { quantity: 1, price: products[5].price, productId: products[5].id },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      number: 2,
      status: OrderStatus.DELIVERED,
      total: 49.0,
      customerId: customers[1].id,
      businessId: business.id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
      items: {
        create: [
          { quantity: 1, price: products[3].price, productId: products[3].id },
          { quantity: 2, price: products[7].price, productId: products[7].id },
          { quantity: 1, price: products[6].price, productId: products[6].id },
        ],
      },
    },
  })

  const order3 = await prisma.order.create({
    data: {
      number: 3,
      status: OrderStatus.IN_PROGRESS,
      total: 33.5,
      customerId: customers[2].id,
      businessId: business.id,
      items: {
        create: [
          { quantity: 1, price: products[1].price, productId: products[1].id },
          { quantity: 1, price: products[4].price, productId: products[4].id },
          { quantity: 1, price: products[5].price, productId: products[5].id },
        ],
      },
    },
  })

  console.log('Orders created:', [order1.number, order2.number, order3.number])
  console.log('\nSeed completed successfully!')
  console.log('\nLogin credentials:')
  console.log('  Email: admin@elrincon.es')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
