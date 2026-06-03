import { Suspense } from 'react'
import CajaContent from './CajaContent'

export const metadata = { title: 'Caja / TPV — HeyOka' }

export default function CajaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">Cargando...</div>}>
      <CajaContent />
    </Suspense>
  )
}
