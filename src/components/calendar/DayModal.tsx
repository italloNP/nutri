// =============================================================================
// components/calendar/DayModal.tsx
// Modal de detalhes do dia selecionado no calendário.
// Exibe macros totais + lista de refeições com items.
// Client Component — controlado pelo NutriContext (isDayModalOpen / selectedDate).
// =============================================================================
'use client'

import { useQuery } from '@tanstack/react-query'
import { useNutri } from '@/context/NutriContext'
import {
  CALORIE_STATUS_COLORS,
  CALORIE_STATUS_LABELS,
  MEAL_TYPE_LABELS,
} from '@/constants/nutrition'
import type { DayLog } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { MealEntry, MacroTotals } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MacroCardProps {
  label: string
  value: number
  unit: string
  color: string
}

import { motion } from 'framer-motion'

function MacroCard({ label, value, unit, color }: MacroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-nutri-surface flex flex-col gap-1 rounded-xl p-3"
    >
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-foreground text-lg font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-muted-foreground text-[11px]">{unit}</span>
      </div>
    </motion.div>
  )
}

interface MealSectionProps {
  meal: MealEntry
  index?: number
}

function MealSection({ meal, index = 0 }: MealSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.05 }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xs font-semibold">
            {MEAL_TYPE_LABELS[meal.type]}
          </span>
          <span className="text-muted-foreground text-[10px]">{formatTime(meal.loggedAt)}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">{meal.totals.calories} kcal</span>
      </div>

      <div className="flex flex-col gap-1">
        {meal.items.map((item) => (
          <div
            key={item.id}
            className="border-nutri-border/50 flex items-center justify-between rounded-lg border px-3 py-1.5"
          >
            <span className="text-foreground/80 text-[11px]">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px]">{item.quantityG}g</span>
              <span className="text-muted-foreground text-[10px]">•</span>
              <span className="text-muted-foreground text-[10px]">{item.calories} kcal</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── MacroSummary ──────────────────────────────────────────────────────────────

interface MacroSummaryProps {
  totals: MacroTotals
}

function MacroSummary({ totals }: MacroSummaryProps) {
  const MACRO_TOKENS = {
    calories: '#f97316',
    protein: '#60a5fa',
    carbs: '#a78bfa',
    fat: '#facc15',
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <MacroCard
        label="Calorias"
        value={totals.calories}
        unit="kcal"
        color={MACRO_TOKENS.calories}
      />
      <MacroCard label="Proteína" value={totals.proteinG} unit="g" color={MACRO_TOKENS.protein} />
      <MacroCard label="Carbs" value={totals.carbsG} unit="g" color={MACRO_TOKENS.carbs} />
      <MacroCard label="Gordura" value={totals.fatG} unit="g" color={MACRO_TOKENS.fat} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DayModal() {
  const { isDayModalOpen, closeDayModal, selectedDate } = useNutri()

  const { data: dayLog, isLoading } = useQuery({
    queryKey: ['dayLog', selectedDate],
    queryFn: async (): Promise<DayLog | null> => {
      if (!selectedDate) return null
      const res = await fetch(`/api/day-log?date=${selectedDate}`)
      if (!res.ok) throw new Error('Falha ao buscar dia')
      return res.json() as Promise<DayLog | null>
    },
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  })

  const statusColor = dayLog ? CALORIE_STATUS_COLORS[dayLog.calorieStatus] : undefined

  return (
    <Dialog open={isDayModalOpen} onOpenChange={(open) => !open && closeDayModal()}>
      <DialogContent className="max-w-md gap-0 p-0">
        {/* Header */}
        <DialogHeader className="border-nutri-border border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-foreground text-sm font-semibold capitalize">
                {selectedDate ? formatDate(selectedDate) : '—'}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2">
                  {dayLog && statusColor ? (
                    <>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                        aria-hidden="true"
                      />
                      <span className="text-[11px]" style={{ color: statusColor }}>
                        {CALORIE_STATUS_LABELS[dayLog.calorieStatus]}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">
                      {isLoading ? 'Carregando...' : 'Sem dados registrados'}
                    </span>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        {isLoading ? (
          <DayModalSkeleton />
        ) : dayLog ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="flex flex-col gap-4 px-5 py-4">
              {/* Macro totals */}
              <MacroSummary totals={dayLog.totals} />

              {/* Divider */}
              <div className="divider-gradient" aria-hidden="true" />

              {/* Meals list */}
              <div className="flex flex-col gap-4">
                {dayLog.meals.map((meal, index) => (
                  <MealSection key={meal.id} meal={meal} index={index} />
                ))}
              </div>

              {/* Notes (if any) */}
              {dayLog.notes && (
                <div className="bg-nutri-surface rounded-xl p-3">
                  <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wider uppercase">
                    Nota do dia
                  </p>
                  <p className="text-foreground/80 text-[11px]">{dayLog.notes}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10">
            <span className="text-4xl" aria-hidden="true">
              🍽️
            </span>
            <p className="text-muted-foreground text-sm">Nenhum registro para este dia.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DayModalSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-nutri-surface h-16 animate-pulse rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-nutri-surface h-24 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}
