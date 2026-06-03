import { Suspense } from 'react'
import ProveedoresContent from './ProveedoresContent'

export default function ProveedoresPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    }>
      <ProveedoresContent />
    </Suspense>
  )
}
