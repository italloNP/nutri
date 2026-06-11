// =============================================================================
// components/calendar/CalendarDayCell.tsx
// Célula individual do grid 7×5 do calendário.
// Exibe número do dia, indicador de cor de status calórico e calorias.
// Client Component — dispara openDayModal no clique.
// =============================================================================
'use client'

import { useNutri } from '@/context/NutriContext'
import { CALORIE_STATUS_COLORS } from '@/constants/nutrition'
import type { CalendarDay } from '@/types'

interface CalendarDayCellProps {
  day: CalendarDay
}

export function CalendarDayCell({ day }: CalendarDayCellProps) {
  const { openDayModal, selectedDate } = useNutri()

  const { date, isCurrentMonth, isToday, dayLog } = day
  const dayNumber = new Date(date + 'T12:00:00Z').getDate()
  const status = dayLog?.calorieStatus ?? 'no_data'
  const statusColor = CALORIE_STATUS_COLORS[status]
  const isSelected = selectedDate === date
  const hasData = status !== 'no_data'

  function handleClick() {
    if (isCurrentMonth) {
      openDayModal(date)
    }
  }

  return (
    <button
      type="button"
      id={`calendar-day-${date}`}
      aria-label={`${date}${hasData ? `, ${dayLog?.totals.calories} kcal` : ', sem dados'}`}
      aria-pressed={isSelected}
      onClick={handleClick}
      disabled={!isCurrentMonth}
      className={[
        'group border-nutri-border/50 transition-nutri relative flex h-16 flex-col items-start justify-start border-r border-b p-1.5',
        'last:border-r-0 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:outline-none',
        isCurrentMonth
          ? 'cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.06]'
          : 'cursor-default opacity-30',
        isSelected && isCurrentMonth ? 'bg-white/[0.05]' : '',
      ]
        .join(' ')
        .trim()}
    >
      {/* Day number */}
      <span
        className={[
          'flex h-5 w-5 items-center justify-center rounded-full text-[11px] leading-none font-medium',
          isToday
            ? 'bg-nutri-primary text-primary-foreground'
            : isCurrentMonth
              ? 'text-foreground'
              : 'text-muted-foreground',
        ].join(' ')}
      >
        {dayNumber}
      </span>

      {hasData && isCurrentMonth && (
        <span className="text-muted-foreground mt-auto mb-2.5 text-[9px] leading-none">
          {dayLog?.totals.calories} kcal
        </span>
      )}

      {/* Status color bar */}
      <span
        className="absolute right-0 bottom-0 left-0 h-1 rounded-b-[0px] transition-all duration-200"
        style={{
          backgroundColor: isCurrentMonth ? statusColor : 'transparent',
          opacity: isCurrentMonth ? (hasData ? 0.85 : 0.2) : 0,
        }}
        aria-hidden="true"
      />
    </button>
  )
}
