'use client'

import { Users, Clock } from 'lucide-react'
import type { RestaurantTable } from '@/types'

function getElapsed(createdAt: Date | string): string {
  const now = Date.now()
  const then = new Date(createdAt).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `hace ${hrs}h ${rem}min` : `hace ${hrs}h`
}

function getTableStyle(table: RestaurantTable): {
  wrapper: string
  badge: string
  statusLabel: string
} {
  if (!table.active) {
    return {
      wrapper: 'bg-gray-100 border-gray-300 opacity-50',
      badge: 'bg-gray-200 text-gray-500',
      statusLabel: 'Inactiva',
    }
  }
  if (!table.currentOrder) {
    return {
      wrapper: 'bg-green-100 border-green-300',
      badge: 'bg-green-200 text-green-700',
      statusLabel: 'Libre',
    }
  }
  const status = table.currentOrder.status
  if (status === 'PENDING') {
    return {
      wrapper: 'bg-red-100 border-red-400',
      badge: 'bg-red-200 text-red-700',
      statusLabel: 'Pendiente',
    }
  }
  if (status === 'READY') {
    return {
      wrapper: 'bg-blue-100 border-blue-400',
      badge: 'bg-blue-200 text-blue-700',
      statusLabel: 'Lista',
    }
  }
  // CONFIRMED, IN_PROGRESS
  return {
    wrapper: 'bg-amber-100 border-amber-400',
    badge: 'bg-amber-200 text-amber-700',
    statusLabel: 'Ocupada',
  }
}

interface TableCardProps {
  table: RestaurantTable
  onClick: (table: RestaurantTable) => void
  style?: React.CSSProperties
  draggable?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
}

export function TableCard({ table, onClick, style, draggable, onMouseDown }: TableCardProps) {
  const { wrapper, badge, statusLabel } = getTableStyle(table)

  return (
    <div
      className={`absolute rounded-xl border-2 shadow-md cursor-pointer select-none transition-shadow hover:shadow-lg flex flex-col items-center justify-center p-2 ${wrapper}`}
      style={{ width: 110, height: 90, ...style }}
      onClick={() => onClick(table)}
      onMouseDown={onMouseDown}
      title={table.name ?? `Mesa ${table.number}`}
    >
      {draggable && (
        <div className="absolute top-1 right-1 text-gray-400 cursor-grab active:cursor-grabbing">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="4" cy="3" r="1" />
            <circle cx="8" cy="3" r="1" />
            <circle cx="4" cy="6" r="1" />
            <circle cx="8" cy="6" r="1" />
            <circle cx="4" cy="9" r="1" />
            <circle cx="8" cy="9" r="1" />
          </svg>
        </div>
      )}
      <span className="text-xl font-bold text-slate-800">{table.number}</span>
      {table.name && (
        <span className="text-xs text-slate-500 truncate max-w-full px-1">{table.name}</span>
      )}
      <div className="flex items-center gap-1 mt-1">
        <Users size={11} className="text-slate-500" />
        <span className="text-xs text-slate-600">{table.capacity}</span>
      </div>
      {table.currentOrder ? (
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${badge}`}>
            #{table.currentOrder.number}
          </span>
        </div>
      ) : (
        <span className={`text-xs font-medium rounded-full px-2 py-0.5 mt-1 ${badge}`}>
          {statusLabel}
        </span>
      )}
      {table.currentOrder && (
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={10} className="text-slate-400" />
          <span className="text-xs text-slate-500">{getElapsed(table.currentOrder.createdAt)}</span>
        </div>
      )}
    </div>
  )
}
