// =============================================================================
// app/dashboard/page.tsx
// Página principal do dashboard — Server Component.
// Etapa 4: Calendário e Gráfico reais substituindo os placeholders.
// =============================================================================
import type { Metadata } from 'next'
import { NutriCalendar } from '@/components/calendar/NutriCalendar'
import { CalorieChart } from '@/components/chart/CalorieChart'
import { DayModal } from '@/components/calendar/DayModal'

export const metadata: Metadata = {
  title: 'Painel Principal',
  description: 'Monitore suas calorias, macros e o progresso diário com o Nutri.',
}

export default function DashboardPage() {
  return (
    <>
      {/* Topo: Calendário de Nutrição (7×5) */}
      <NutriCalendar />

      {/* Base: Gráfico Recharts — Consumo vs. Manutenção */}
      <CalorieChart />

      {/* Modal global — controlado pelo NutriContext (abre ao clicar no calendário) */}
      <DayModal />
    </>
  )
}
