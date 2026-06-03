import { Suspense } from 'react'
import FacturacionContent from './FacturacionContent'

export default function FacturacionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Cargando facturación...</div>}>
      <FacturacionContent />
    </Suspense>
  )
}
