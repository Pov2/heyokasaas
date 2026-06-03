'use client'

import { useState, useRef, useCallback } from 'react'
import { Plus, Save, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TableCard } from './TableCard'
import type { RestaurantTable } from '@/types'

interface TableMapEditorProps {
  tables: RestaurantTable[]
  editMode: boolean
  onTableClick: (table: RestaurantTable) => void
  onPositionsChange: (tables: RestaurantTable[]) => void
  onAddTable: () => void
}

interface DragState {
  tableId: string
  startMouseX: number
  startMouseY: number
  startPosX: number
  startPosY: number
}

const MAP_WIDTH = 800
const MAP_HEIGHT = 560

export function TableMapEditor({
  tables,
  editMode,
  onTableClick,
  onPositionsChange,
  onAddTable,
}: TableMapEditorProps) {
  const [localTables, setLocalTables] = useState<RestaurantTable[]>(tables)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const dragRef = useRef<DragState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync when parent tables change (e.g. after refresh)
  // We only sync if not currently dragging and not dirty
  const prevTablesRef = useRef(tables)
  if (prevTablesRef.current !== tables && !dirty) {
    prevTablesRef.current = tables
    setLocalTables(tables)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, table: RestaurantTable) => {
      if (!editMode) return
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = {
        tableId: table.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPosX: table.posX,
        startPosY: table.posY,
      }

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const scaleX = MAP_WIDTH / rect.width
        const scaleY = MAP_HEIGHT / rect.height
        const dx = (ev.clientX - dragRef.current.startMouseX) * scaleX
        const dy = (ev.clientY - dragRef.current.startMouseY) * scaleY
        const newX = Math.max(0, Math.min(MAP_WIDTH - 110, dragRef.current.startPosX + dx))
        const newY = Math.max(0, Math.min(MAP_HEIGHT - 90, dragRef.current.startPosY + dy))

        setLocalTables((prev) =>
          prev.map((t) =>
            t.id === dragRef.current!.tableId ? { ...t, posX: newX, posY: newY } : t
          )
        )
      }

      const onMouseUp = () => {
        dragRef.current = null
        setDirty(true)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [editMode]
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        localTables.map((t) =>
          fetch(`/api/tables/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ posX: t.posX, posY: t.posY }),
          })
        )
      )
      setDirty(false)
      onPositionsChange(localTables)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {editMode && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onAddTable} className="gap-1.5">
            <Plus size={14} />
            Añadir mesa
          </Button>
          {dirty && (
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="gap-1.5">
              <Save size={14} />
              {saving ? 'Guardando...' : 'Guardar disposición'}
            </Button>
          )}
          <p className="text-xs text-slate-500 ml-2">Arrastra las mesas para reorganizarlas</p>
        </div>
      )}

      {/* Map canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
        style={{
          width: '100%',
          paddingBottom: `${(MAP_HEIGHT / MAP_WIDTH) * 100}%`,
          backgroundImage:
            'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        >
          {localTables.map((table) => {
            const rect = containerRef.current?.getBoundingClientRect()
            const scaleX = rect ? rect.width / MAP_WIDTH : 1
            const scaleY = rect ? (rect.height || (rect.width * MAP_HEIGHT) / MAP_WIDTH) / MAP_HEIGHT : 1

            return (
              <TableCard
                key={table.id}
                table={table}
                onClick={editMode ? () => {} : onTableClick}
                draggable={editMode}
                onMouseDown={editMode ? (e) => handleMouseDown(e, table) : undefined}
                style={{
                  left: `${(table.posX / MAP_WIDTH) * 100}%`,
                  top: `${(table.posY / MAP_HEIGHT) * 100}%`,
                  width: `${(110 / MAP_WIDTH) * 100}%`,
                  height: `${(90 / MAP_HEIGHT) * 100}%`,
                  cursor: editMode ? 'grab' : 'pointer',
                }}
              />
            )
          })}

          {localTables.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <LayoutGrid size={40} className="text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No hay mesas configuradas</p>
              {editMode && (
                <p className="text-slate-300 text-xs mt-1">Usa "Añadir mesa" para empezar</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
