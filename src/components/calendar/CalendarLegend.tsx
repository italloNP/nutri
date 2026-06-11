// =============================================================================
// components/calendar/CalendarLegend.tsx
// Legenda de cores do status calórico do calendário.
// Componente puramente visual — sem estado.
// =============================================================================

import { CALORIE_STATUS_COLORS, CALORIE_STATUS_LABELS } from '@/constants/nutrition'
import type { CalorieStatus } from '@/constants/nutrition'

const LEGEND_STATUSES: CalorieStatus[] = [
  'severe_deficit',
  'moderate_deficit',
  'balanced',
  'slight_surplus',
  'surplus',
]

export function CalendarLegend() {
  return (
    <div className="border-nutri-border flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t px-4 py-2.5">
      {LEGEND_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: CALORIE_STATUS_COLORS[status] }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground text-[10px]">{CALORIE_STATUS_LABELS[status]}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: CALORIE_STATUS_COLORS['no_data'] }}
          aria-hidden="true"
        />
        <span className="text-muted-foreground text-[10px]">
          {CALORIE_STATUS_LABELS['no_data']}
        </span>
      </div>
    </div>
  )
}
