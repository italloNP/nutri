// =============================================================================
// components/calendar/CalendarPlaceholder.tsx
// Placeholder visual do Calendário — substituído na Etapa 4.
// Mostra o skeleton do grid 7×5 para validar o layout.
// =============================================================================
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function CalendarPlaceholder() {
  return (
    <div className="border-nutri-border bg-nutri-surface flex flex-col gap-0 overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="border-nutri-border flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-foreground text-sm font-semibold">Meu Calendário de Nutrição</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Mês anterior"
            className="text-muted-foreground transition-nutri hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Próximo mês"
            className="text-muted-foreground transition-nutri hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

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

      {/* Grid skeleton 7×5 */}
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="group border-nutri-border/50 transition-nutri relative flex h-16 cursor-pointer flex-col items-start justify-start border-r border-b p-1.5 last:border-r-0 hover:bg-white/3"
          >
            {/* Day number skeleton */}
            <div className="bg-nutri-surface-overlay h-4 w-4 animate-pulse rounded" />
            {/* Color indicator skeleton */}
            <div className="bg-nutri-surface-overlay mt-auto h-1.5 w-full animate-pulse rounded-full opacity-50" />
          </div>
        ))}
      </div>

      {/* Footer status */}
      <div className="border-nutri-border flex items-center gap-1.5 border-t px-4 py-2">
        <CalendarDays size={12} className="text-muted-foreground" />
        <span className="text-muted-foreground text-[10px]">
          Calendário — implementado na Etapa 4
        </span>
      </div>
    </div>
  )
}
