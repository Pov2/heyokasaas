@AGENTS.md

# HeyOka – HORECA ERP/CRM SaaS

## Overview

HeyOka is a SaaS ERP/CRM platform for the HORECA sector (Hotels, Restaurants, Cafes). It supports restaurants, bars, take-away, hotels, catering, and dark kitchens.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Prisma ORM v7
- **Auth**: NextAuth.js v5 (beta) with Credentials provider and JWT sessions
- **UI Components**: Radix UI primitives + lucide-react icons

## Project Structure

```
src/
  app/
    (auth)/login/        # Login page (public)
    (dashboard)/         # Protected dashboard layout + pages
      layout.tsx         # Sidebar nav layout
      dashboard/         # Main dashboard with KPI cards
    api/auth/[...nextauth]/  # NextAuth route handlers
    page.tsx             # Root redirect to /dashboard
    layout.tsx           # Root layout with metadata
  lib/
    prisma.ts            # Prisma client singleton (with PrismaPg adapter)
    auth.ts              # NextAuth configuration
    utils.ts             # cn() utility (clsx + tailwind-merge)
  proxy.ts               # Route protection (replaces middleware in Next.js 16)
  components/ui/         # Shared UI components

prisma/
  schema.prisma          # Database schema

prisma.config.ts         # Prisma v7 configuration
```

## Data Models

- **Business** - Multi-tenant root (Restaurant, Bar, Hotel, etc.)
- **User** - Belongs to a business, has roles: OWNER, ADMIN, MANAGER, STAFF
- **Customer** - CRM contacts per business
- **Supplier** - Supplier/vendor management
- **Product** - Menu items or inventory products
- **Category** - Product categorization
- **Order** - Orders with status workflow (PENDING → DELIVERED)
- **OrderItem** - Line items on orders
- **Employee** - HR / staff management
- **Reservation** - Table reservations (for RESTAURANTE type)

## Getting Started

### 1. Environment setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - App URL (e.g. `http://localhost:3000`)

### 2. Database setup

```bash
npx prisma migrate dev --name init
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard` (or `/login` if not authenticated).

### 4. Build for production

```bash
npm run build
npm start
```

## Design System

- **Sidebar**: `bg-slate-900` dark background
- **Accent color**: Amber/orange (`amber-500`) for HORECA/food industry feel
- **Content area**: White (`bg-white`) with slate borders
- **Typography**: Geist Sans

## Key Architecture Decisions

- **Multi-tenancy**: Each `Business` is a tenant. All data models reference `businessId`.
- **Auth strategy**: JWT sessions (stateless) with credentials provider. Session includes `businessId`, `businessName`, `businessType`, and `role`.
- **Prisma v7**: Uses `PrismaPg` driver adapter — the `DATABASE_URL` is passed directly to the adapter rather than via schema datasource.
- **Route protection**: `src/proxy.ts` (Next.js 16 convention, replaces `middleware.ts`).
- **Reservations**: Only shown in sidebar when `businessType === 'RESTAURANTE'`.
