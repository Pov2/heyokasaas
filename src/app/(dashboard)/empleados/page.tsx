import { Suspense } from 'react'
import EmpleadosContent from './EmpleadosContent'

export default function EmpleadosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <EmpleadosContent />
    </Suspense>
  )
}
