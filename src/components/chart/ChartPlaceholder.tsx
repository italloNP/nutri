// =============================================================================
// components/chart/ChartPlaceholder.tsx
// Placeholder visual do Gráfico Recharts — substituído na Etapa 4.
// Mostra o skeleton do gráfico de área para validar o layout.
// =============================================================================
import { TrendingUp } from 'lucide-react'

export function ChartPlaceholder() {
  return (
    <div className="border-nutri-border bg-nutri-surface flex flex-1 flex-col gap-0 overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="border-nutri-border flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">
            Análise de Calorias vs. Manutenção Diária
          </h2>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            Meta de Manutenção (2200 kcal) • Déficit/Excesso vs. Esta Linha
          </p>
        </div>
        <TrendingUp size={16} className="text-muted-foreground" />
      </div>

      {/* Chart skeleton */}
      <div className="flex min-h-[160px] flex-1 items-end gap-1 px-4 pt-6 pb-4">
        {/* Simulated bar heights */}
        {[60, 80, 45, 90, 70, 55, 95, 65, 85, 40, 75, 50, 88, 72].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="bg-nutri-primary/20 w-full animate-pulse rounded-sm"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>

      {/* X-axis labels skeleton */}
      <div className="flex items-center justify-between px-4 pb-3">
        {['19 abr', '23 abr', '27 abr', '31 abr', '02 mai', '03 mai'].map((label) => (
          <span key={label} className="text-muted-foreground/50 text-[9px]">
            {label}
          </span>
        ))}
      </div>

      <div className="px-4 pb-2">
        <span className="text-muted-foreground text-[10px]">
          Gráfico Recharts — implementado na Etapa 4
        </span>
      </div>
    </div>
  )
}
