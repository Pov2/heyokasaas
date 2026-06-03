import { Suspense } from 'react'
import StockContent from './StockContent'

export default function StockPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}>
      <StockContent />
    </Suspense>
  )
}
