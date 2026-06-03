'use client'

interface DayRevenue {
  date: string
  total: number
}

interface RevenueChartProps {
  data: DayRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400">
        <p className="text-sm">Sin datos de ingresos este mes</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.total))

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-40 relative">
        {/* Y-axis max label */}
        <div className="absolute -top-5 left-0 text-xs text-slate-400">
          {maxValue.toFixed(0)} €
        </div>
        {data.map(({ date, total }) => {
          const heightPct = maxValue > 0 ? (total / maxValue) * 100 : 0
          const day = date.split('-')[2]
          return (
            <div
              key={date}
              className="flex flex-col items-center flex-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {total.toFixed(2)} €
                </div>
                <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
              </div>
              <div
                className="w-full bg-amber-400 rounded-t hover:bg-amber-500 transition-colors cursor-pointer"
                style={{ height: `${heightPct}%`, minHeight: total > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-slate-400 mt-1">{day}</span>
            </div>
          )
        })}
      </div>
      {/* X-axis label */}
      <div className="text-center text-xs text-slate-400 mt-2">Día del mes</div>
    </div>
  )
}
