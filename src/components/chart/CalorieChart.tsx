// =============================================================================
// components/chart/CalorieChart.tsx
// Gráfico Recharts de Área — Consumo vs. Manutenção Calórica.
// Client Component — dados via useQuery + getMockChartData / getMockChartAnnotations.
//
// Estrutura:
//   AreaChart (Recharts)
//     defs > linearGradient (fill area consumed)
//     Area (consumed)
//     ReferenceLine (maintenance goal / tracejada)
//     ReferenceDot (anotações contextuais)
//     XAxis / YAxis (clean — sem grid excessivo)
//     Tooltip customizado
// =============================================================================
'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import type { CalorieChartPoint, ChartAnnotation } from '@/types'
import { CALORIE_STATUS_COLORS, CALORIE_STATUS_LABELS } from '@/constants/nutrition'
import { DEFAULT_CALORIE_GOAL } from '@/constants/nutrition'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { Payload } from 'recharts/types/component/DefaultTooltipContent'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLOR_CONSUMED = 'oklch(0.68 0.19 35)' // --chart-1 (coral-orange)
const COLOR_MAINTENANCE = 'oklch(0.67 0.18 145)' // --chart-2 (green)
const COLOR_AXIS = 'oklch(0.58 0.01 265 / 50%)' // --muted-foreground / 50%

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  payload?: Payload<ValueType, NameType>[]
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0]?.payload as CalorieChartPoint | undefined
  if (!point) return null

  const delta = point.delta
  const isOver = delta > 0
  const isNeutral = Math.abs(delta) < 50
  const statusColor = CALORIE_STATUS_COLORS[point.calorieStatus]

  const DeltaIcon = isNeutral ? Minus : isOver ? TrendingUp : TrendingDown

  return (
    <div
      className="border-nutri-border bg-nutri-surface-elevated flex min-w-[160px] flex-col gap-2 rounded-xl border p-3 shadow-xl"
      role="tooltip"
    >
      <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground text-[11px]">Consumido</span>
          <span className="text-foreground text-xs font-bold">{point.consumed} kcal</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground text-[11px]">Meta</span>
          <span style={{ color: COLOR_MAINTENANCE }} className="text-xs font-medium">
            {point.maintenance} kcal
          </span>
        </div>
      </div>

      <div className="border-nutri-border border-t pt-2">
        <div className="flex items-center gap-1.5">
          <DeltaIcon size={10} style={{ color: statusColor }} />
          <span className="text-[10px] font-medium" style={{ color: statusColor }}>
            {CALORIE_STATUS_LABELS[point.calorieStatus]}
          </span>
          <span className="text-muted-foreground ml-auto text-[10px]">
            {delta >= 0 ? '+' : ''}
            {delta} kcal
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Annotation Dot ───────────────────────────────────────────────────────────

interface AnnotationDotProps {
  cx?: number
  cy?: number
  annotation: ChartAnnotation
}

function AnnotationDot({ cx, cy, annotation }: AnnotationDotProps) {
  if (cx === undefined || cy === undefined) return null
  const color = CALORIE_STATUS_COLORS[annotation.calorieStatus]

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="none" opacity={0.9} />
      <circle cx={cx} cy={cy} r={9} fill={color} stroke="none" opacity={0.2} />
    </g>
  )
}

// ─── Chart Header Stats ───────────────────────────────────────────────────────

interface ChartStatsProps {
  data: CalorieChartPoint[]
}

function ChartStats({ data }: ChartStatsProps) {
  if (data.length === 0) return null

  const avg = Math.round(data.reduce((s, p) => s + p.consumed, 0) / data.length)
  const avgDelta = avg - DEFAULT_CALORIE_GOAL
  const isAvgOver = avgDelta > 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-muted-foreground text-[9px] tracking-wider uppercase">
          Média ({data.length}d)
        </span>
        <span className="text-foreground text-sm font-bold">{avg} kcal</span>
      </div>
      <div className="flex flex-col">
        <span className="text-muted-foreground text-[9px] tracking-wider uppercase">vs Meta</span>
        <span
          className="text-sm font-bold"
          style={{
            color: isAvgOver
              ? CALORIE_STATUS_COLORS['surplus']
              : CALORIE_STATUS_COLORS['moderate_deficit'],
          }}
        >
          {isAvgOver ? '+' : ''}
          {avgDelta} kcal
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CalorieChart() {
  const { data: chartData = [], isLoading: isChartLoading } = useQuery({
    queryKey: ['chartData', 14],
    queryFn: async (): Promise<CalorieChartPoint[]> => {
      const res = await fetch('/api/chart?days=14')
      if (!res.ok) throw new Error('Falha ao buscar gráfico')
      const json = (await res.json()) as {
        chartData: CalorieChartPoint[]
        annotations: ChartAnnotation[]
      }
      return json.chartData
    },
    staleTime: 60 * 1000,
  })

  const { data: annotations = [] } = useQuery({
    queryKey: ['chartAnnotations'],
    queryFn: async (): Promise<ChartAnnotation[]> => {
      const res = await fetch('/api/chart?days=14')
      if (!res.ok) throw new Error('Falha ao buscar anotações')
      const json = (await res.json()) as {
        chartData: CalorieChartPoint[]
        annotations: ChartAnnotation[]
      }
      return json.annotations
    },
    staleTime: 60 * 1000,
  })

  // Build annotation lookup: date → ChartAnnotation
  const annotationMap = new Map(annotations.map((a) => [a.date, a]))

  return (
    <div className="border-nutri-border bg-nutri-surface flex flex-1 flex-col overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="border-nutri-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-foreground text-sm font-semibold">Consumo vs. Manutenção</h2>
          <p className="text-muted-foreground text-[11px]">
            Meta: {DEFAULT_CALORIE_GOAL} kcal/dia • Últimos 14 dias com registros
          </p>
        </div>

        {!isChartLoading && chartData.length > 0 && <ChartStats data={chartData} />}
      </div>

      {/* Chart area */}
      <div className="flex flex-1 flex-col">
        {isChartLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">Sem dados disponíveis.</p>
          </div>
        ) : (
          <div className="relative min-h-0 min-w-0 flex-1 px-2 pt-4 pb-2">
            <div className="absolute inset-0 px-2 pt-4 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    {/* Gradient for consumed area */}
                    <linearGradient id="gradConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLOR_CONSUMED} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLOR_CONSUMED} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  {/* Subtle horizontal grid only */}
                  <CartesianGrid vertical={false} stroke="oklch(1 0 0 / 5%)" strokeDasharray="0" />

                  <XAxis
                    dataKey="label"
                    tick={{ fill: COLOR_AXIS, fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    tick={{ fill: COLOR_AXIS, fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    tickFormatter={(v: number) => `${v}`}
                    domain={['auto', 'auto']}
                  />

                  {/* Custom tooltip */}
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: 'oklch(1 0 0 / 10%)', strokeWidth: 1 }}
                  />

                  {/* Maintenance reference line */}
                  <ReferenceLine
                    y={DEFAULT_CALORIE_GOAL}
                    stroke={COLOR_MAINTENANCE}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Meta',
                      fill: COLOR_MAINTENANCE,
                      fontSize: 9,
                      position: 'insideTopRight',
                      dy: -4,
                    }}
                  />

                  {/* Consumed area */}
                  <Area
                    type="monotone"
                    dataKey="consumed"
                    stroke={COLOR_CONSUMED}
                    strokeWidth={2}
                    fill="url(#gradConsumed)"
                    activeDot={{ r: 4, fill: COLOR_CONSUMED, strokeWidth: 0 }}
                    dot={false}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />

                  {/* Annotation dots */}
                  {chartData.map((point) => {
                    const annotation = annotationMap.get(point.date)
                    if (!annotation) return null
                    return (
                      <ReferenceDot
                        key={point.date}
                        x={point.label}
                        y={point.consumed}
                        r={0}
                        shape={(props: { cx?: number; cy?: number }) => (
                          <AnnotationDot cx={props.cx} cy={props.cy} annotation={annotation} />
                        )}
                      />
                    )
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Legend row */}
        {!isChartLoading && (
          <div className="border-nutri-border flex items-center gap-4 border-t px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: COLOR_CONSUMED }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground text-[10px]">Consumo real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="2" aria-hidden="true">
                <line
                  x1="0"
                  y1="1"
                  x2="16"
                  y2="1"
                  stroke={COLOR_MAINTENANCE}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </svg>
              <span className="text-muted-foreground text-[10px]">Meta de manutenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CALORIE_STATUS_COLORS['surplus'] }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground text-[10px]">Eventos anotados</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex min-h-[160px] flex-1 items-end gap-1 px-4 pt-6 pb-4">
      {[60, 80, 45, 90, 70, 55, 95, 65, 85, 40, 75, 50, 88, 72].map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="bg-nutri-primary/15 w-full animate-pulse rounded-sm"
            style={{ height: `${h}%` }}
          />
        </div>
      ))}
    </div>
  )
}
