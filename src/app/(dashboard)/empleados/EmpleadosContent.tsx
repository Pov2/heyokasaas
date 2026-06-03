'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, UserPlus, Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeModal } from '@/components/employees/EmployeeModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Employee } from '@/types'

export default function EmpleadosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [positionFilter, setPositionFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  const fetchEmployees = useCallback(async (q: string, active: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (active) params.set('active', active)
      const url = `/api/employees${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(search, activeFilter)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      router.replace(`/empleados${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, activeFilter, fetchEmployees, router])

  const handleSuccess = (employee: Employee) => {
    setEmployees((prev) => {
      const exists = prev.find((e) => e.id === employee.id)
      if (exists) return prev.map((e) => (e.id === employee.id ? employee : e))
      return [employee, ...prev]
    })
  }

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee)
    setModalOpen(true)
  }

  const handleDeleted = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
  }

  // Unique positions for filter dropdown
  const uniquePositions = useMemo(() => {
    const positions = employees.map((e) => e.position).filter(Boolean) as string[]
    return Array.from(new Set(positions)).sort()
  }, [employees])

  // Filtered employees by position (client-side, since search+active are server-side)
  const filteredEmployees = useMemo(() => {
    if (!positionFilter) return employees
    return employees.filter((e) => e.position === positionFilter)
  }, [employees, positionFilter])

  // Stats
  const totalEmpleados = employees.length
  const totalActivos = employees.filter((e) => e.active).length
  const enNomina = employees.filter((e) => e.active && e.salary != null && e.salary > 0).length
  const costeMensual = employees
    .filter((e) => e.active && e.salary != null)
    .reduce((sum, e) => sum + (e.salary ?? 0), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empleados</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading
              ? 'Cargando...'
              : `${totalEmpleados} empleado${totalEmpleados !== 1 ? 's' : ''} registrado${totalEmpleados !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditEmployee(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <UserPlus size={16} />
          Nuevo empleado
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total empleados</p>
              <p className="text-2xl font-bold text-slate-900">{totalEmpleados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Activos</p>
              <p className="text-2xl font-bold text-slate-900">{totalActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">En nómina</p>
              <p className="text-2xl font-bold text-slate-900">{enNomina}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border shadow-sm p-4 ${costeMensual > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${costeMensual > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <DollarSign size={18} className={costeMensual > 0 ? 'text-amber-600' : 'text-slate-500'} />
            </div>
            <div>
              <p className={`text-xs ${costeMensual > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Coste mensual</p>
              <p className={`text-xl font-bold ${costeMensual > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {costeMensual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, puesto o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          {uniquePositions.length > 0 && (
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="">Todos los puestos</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table / States */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Cargando empleados...</p>
          </div>
        ) : filteredEmployees.length === 0 && (search || activeFilter || positionFilter) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sin resultados</p>
            <p className="text-slate-400 text-sm mt-1">
              No se encontraron empleados con los filtros aplicados
            </p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Users size={28} className="text-amber-500" />
            </div>
            <p className="text-slate-700 font-semibold text-lg">No tienes empleados aún</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Empieza añadiendo tu primer empleado</p>
            <Button
              onClick={() => {
                setEditEmployee(null)
                setModalOpen(true)
              }}
            >
              <UserPlus size={16} />
              Crear primer empleado
            </Button>
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={handleEdit}
            onDeleted={handleDeleted}
          />
        )}
      </div>

      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditEmployee(null)
        }}
        onSuccess={handleSuccess}
        editEmployee={editEmployee}
      />
    </div>
  )
}
