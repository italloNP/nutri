// =============================================================================
// context/NutriContext.tsx
// Estado partilhado entre Calendário, Gráfico e Chat IA.
// Elevado aqui para evitar prop drilling e manter Server Components intactos.
// "use client" — injetado via <ClientProvider> no layout raiz.
// =============================================================================
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

// ─── Tipos do contexto ────────────────────────────────────────────────────────

interface CalendarMonthState {
  year: number
  month: number
}

interface NutriContextValue {
  /** Data selecionada no calendário (YYYY-MM-DD) — null = nenhuma selecionada */
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void

  /** Mês/ano exibido no calendário */
  calendarMonth: CalendarMonthState
  goToPreviousMonth: () => void
  goToNextMonth: () => void

  /** true quando o modal de detalhes do dia está aberto */
  isDayModalOpen: boolean
  openDayModal: (date: string) => void
  closeDayModal: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NutriContext = createContext<NutriContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

interface NutriProviderProps {
  children: ReactNode
}

export function NutriProvider({ children }: NutriProviderProps) {
  const today = new Date()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonthState>({
    year: today.getFullYear(),
    month: today.getMonth() + 1, // 1-indexed
  })
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)

  function goToPreviousMonth() {
    setCalendarMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 }
      return { ...prev, month: prev.month - 1 }
    })
  }

  function goToNextMonth() {
    setCalendarMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 }
      return { ...prev, month: prev.month + 1 }
    })
  }

  function openDayModal(date: string) {
    setSelectedDate(date)
    setIsDayModalOpen(true)
  }

  function closeDayModal() {
    setIsDayModalOpen(false)
  }

  const value: NutriContextValue = {
    selectedDate,
    setSelectedDate,
    calendarMonth,
    goToPreviousMonth,
    goToNextMonth,
    isDayModalOpen,
    openDayModal,
    closeDayModal,
  }

  return <NutriContext.Provider value={value}>{children}</NutriContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Consome o NutriContext.
 * Lança erro se usado fora do <ClientProvider>.
 */
export function useNutri(): NutriContextValue {
  const ctx = useContext(NutriContext)
  if (!ctx) {
    throw new Error('useNutri must be used within a <ClientProvider>')
  }
  return ctx
}
