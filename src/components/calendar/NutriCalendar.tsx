// =============================================================================
// components/calendar/NutriCalendar.tsx
// Orquestrador do Calendário — Client Component.
// Faz useQuery para getMockCalendarMonth e compõe Header + Grid + Legend.
// =============================================================================
'use client'

import { useQuery } from '@tanstack/react-query'
import { useNutri } from '@/context/NutriContext'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { CalendarLegend } from './CalendarLegend'
import type { CalendarMonth } from '@/types'

export function NutriCalendar() {
  const { calendarMonth } = useNutri()
  const { year, month } = calendarMonth

  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async (): Promise<CalendarMonth> => {
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`)
      if (!res.ok) throw new Error('Falha ao buscar calendário')
      return res.json() as Promise<CalendarMonth>
    },
    staleTime: 60 * 1000,
  })

  if (isError) {
    return (
      <div className="border-nutri-border bg-nutri-surface flex flex-col overflow-hidden rounded-xl border">
        <CalendarHeader />
        <div className="flex flex-1 items-center justify-center py-10">
          <p className="text-muted-foreground text-sm">Erro ao carregar o calendário.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-nutri-border bg-nutri-surface flex flex-col overflow-hidden rounded-xl border">
      {/* Navigation header */}
      <CalendarHeader />

      {/* Grid skeleton while loading */}
      {isLoading || !data ? <CalendarGridSkeleton /> : <CalendarGrid days={data.days} />}

      {/* Color legend */}
      <CalendarLegend />
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarGridSkeleton() {
  return (
    <div className="flex-1">
      {/* Week day headers skeleton */}
      <div className="border-nutri-border grid grid-cols-7 border-b">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center py-2">
            <div className="bg-nutri-surface-overlay h-2.5 w-5 animate-pulse rounded" />
          </div>
        ))}
      </div>
      {/* Day cells skeleton */}
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="border-nutri-border/50 relative flex h-16 flex-col items-start justify-start border-r border-b p-1.5 last:border-r-0"
          >
            <div className="bg-nutri-surface-overlay h-4 w-4 animate-pulse rounded-full" />
            <div className="bg-nutri-surface-overlay absolute right-0 bottom-0 left-0 h-1 animate-pulse opacity-30" />
          </div>
        ))}
      </div>
    </div>
  )
}
