// =============================================================================
// components/calendar/CalendarGrid.tsx
// Grid 7×5 do calendário — renderiza 35 células.
// Recebe CalendarDay[] via props; célula individual é CalendarDayCell.
// =============================================================================
import { CalendarDayCell } from './CalendarDayCell'
import type { CalendarDay } from '@/types'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const

interface CalendarGridProps {
  days: CalendarDay[]
}

export function CalendarGrid({ days }: CalendarGridProps) {
  return (
    <div className="flex-1">
      {/* Week day headers */}
      <div className="border-nutri-border grid grid-cols-7 border-b">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground flex items-center justify-center py-2 text-[10px] font-medium tracking-wider uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDayCell key={day.date} day={day} />
        ))}
      </div>
    </div>
  )
}
