// =============================================================================
// app/dashboard/page.tsx
// Página principal do dashboard — Server Component.
// Renderiza os placeholders de Calendário e Gráfico (implementados na Etapa 4).
// =============================================================================
import type { Metadata } from 'next'
import { CalendarPlaceholder } from '@/components/calendar/CalendarPlaceholder'
import { ChartPlaceholder } from '@/components/chart/ChartPlaceholder'

export const metadata: Metadata = {
  title: 'Painel Principal',
}

export default function DashboardPage() {
  return (
    <>
      {/* Topo: Calendário de Nutrição (7×5) */}
      <CalendarPlaceholder />

      {/* Base: Gráfico Recharts — Consumo vs. Manutenção */}
      <ChartPlaceholder />
    </>
  )
}
