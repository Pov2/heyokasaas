import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  label: string
  value: string | number
  trend?: number // positive = up, negative = down (percentage or absolute)
  trendLabel?: string
  icon?: LucideIcon
}

export function SummaryCard({ label, value, trend, trendLabel, icon: Icon }: SummaryCardProps) {
  const hasTrend = trend !== undefined
  const isUp = hasTrend && trend >= 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      {hasTrend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{trendLabel ?? `${isUp ? '+' : ''}${trend.toFixed(1)}%`}</span>
          <span className="text-slate-400 font-normal">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
