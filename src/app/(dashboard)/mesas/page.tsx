import { Suspense } from 'react'
import MesasContent from './MesasContent'

export const metadata = {
  title: 'Mesas — HeyOka',
}

export default function MesasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Cargando mesas...</p>
        </div>
      }
    >
      <MesasContent />
    </Suspense>
  )
}
