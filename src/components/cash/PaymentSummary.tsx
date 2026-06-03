interface PaymentSummaryProps {
  cash: number
  card: number
  bizum: number
  total: number
}

export function PaymentSummary({ cash, card, bizum, total }: PaymentSummaryProps) {
  const items = [
    { label: 'Efectivo', value: cash, colorClass: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Tarjeta', value: card, colorClass: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Bizum', value: bizum, colorClass: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'Total del día', value: total, colorClass: 'text-amber-700 bg-amber-50 border-amber-200', bold: true },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => (
        <div key={item.label} className={`rounded-xl border shadow-sm p-4 ${item.colorClass}`}>
          <p className="text-xs font-medium opacity-70">{item.label}</p>
          <p className={`text-xl mt-1 ${item.bold ? 'font-bold' : 'font-semibold'}`}>
            {item.value.toFixed(2)} €
          </p>
        </div>
      ))}
    </div>
  )
}
