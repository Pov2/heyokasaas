import { Suspense } from 'react'
import CartaContent from './CartaContent'

export default function CartaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Cargando carta...</div>}>
      <CartaContent />
    </Suspense>
  )
}
