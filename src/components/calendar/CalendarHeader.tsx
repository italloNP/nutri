// =============================================================================
// components/calendar/CalendarHeader.tsx
// Barra de navegação do calendário (mês/ano + chevrons).
// Client Component — consome useNutri() para navegação.
// =============================================================================
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNutri } from '@/context/NutriContext'

const MONTH_LABELS: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
}

export function CalendarHeader() {
  const { calendarMonth, goToPreviousMonth, goToNextMonth } = useNutri()
  const { year, month } = calendarMonth

  const isCurrentMonth = (() => {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() + 1 === month
  })()

  return (
    <div className="border-nutri-border flex items-center justify-between border-b px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-foreground text-sm font-semibold">Calendário Nutricional</h2>
        <p className="text-muted-foreground text-[11px]">
          {MONTH_LABELS[month]} {year}
          {isCurrentMonth && (
            <span className="text-nutri-primary ml-1.5 font-medium">• Mês atual</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          id="calendar-prev-month"
          aria-label="Mês anterior"
          onClick={goToPreviousMonth}
          className="text-muted-foreground transition-nutri hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 active:scale-95"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          id="calendar-next-month"
          aria-label="Próximo mês"
          onClick={goToNextMonth}
          className="text-muted-foreground transition-nutri hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 active:scale-95"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
