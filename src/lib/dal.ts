// =============================================================================
// lib/dal.ts
// Data Access Layer — substitui as funções do mock-data.ts por queries Drizzle.
//
// REGRAS:
// - Assinaturas idênticas às funções do mock-data.ts (zero breaking changes nos consumers)
// - Todos os retornos são compatíveis com os tipos em src/types/index.ts
// - Usa CURRENT_USER_ID como chave de acesso (substituído por session na Etapa 7)
// =============================================================================
import { eq, and, gte, lte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { dayLogs, users, mealEntries, foodItems } from '@/lib/db/schema'
import { CURRENT_USER_ID } from '@/lib/current-user'
import { CALORIE_STATUS_THRESHOLDS } from '@/constants/nutrition'
import type {
  User,
  DayLog,
  MealEntry,
  MacroTotals,
  CalendarDay,
  CalendarMonth,
  CalorieChartPoint,
  ChartAnnotation,
  FoodItem,
  MealType,
} from '@/types'
import type { CalorieStatus } from '@/constants/nutrition'

// ─── Helpers internos ─────────────────────────────────────────────────────────

function toLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Transforma os rows brutos do DB (com meal_entries e food_items) em DayLog tipado */
function rowToDayLog(row: {
  id: string
  userId: string
  date: string
  calories: number
  carbsG: number
  fatG: number
  proteinG: number
  calorieStatus: string
  notes: string | null
  mealEntries: Array<{
    id: string
    dayLogId: string
    type: string
    loggedAt: Date
    foodItems: Array<{
      id: string
      mealEntryId: string
      name: string
      quantityG: number
      calories: number
      carbsG: number
      fatG: number
      proteinG: number
    }>
  }>
}): DayLog {
  const meals: MealEntry[] = row.mealEntries.map((meal) => {
    const items: FoodItem[] = meal.foodItems.map((fi) => ({
      id: fi.id,
      name: fi.name,
      quantityG: fi.quantityG,
      calories: fi.calories,
      carbsG: fi.carbsG,
      fatG: fi.fatG,
      proteinG: fi.proteinG,
    }))

    const totals: MacroTotals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        carbsG: acc.carbsG + item.carbsG,
        fatG: acc.fatG + item.fatG,
        proteinG: acc.proteinG + item.proteinG,
      }),
      { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
    )

    return {
      id: meal.id,
      dayLogId: meal.dayLogId,
      type: meal.type as MealEntry['type'],
      loggedAt: meal.loggedAt.toISOString(),
      items,
      totals,
    }
  })

  const totals: MacroTotals = {
    calories: row.calories,
    carbsG: row.carbsG,
    fatG: row.fatG,
    proteinG: row.proteinG,
  }

  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    meals,
    totals,
    calorieStatus: row.calorieStatus as CalorieStatus,
    notes: row.notes,
  }
}

// ─── User ─────────────────────────────────────────────────────────────────────

/** Retorna o usuário atual com suas metas nutricionais */
export async function getUser(): Promise<User> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, CURRENT_USER_ID),
    with: { goals: true },
  })

  if (!row) {
    throw new Error(`[dal] Usuário ${CURRENT_USER_ID} não encontrado. Execute npm run db:seed.`)
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    goals: {
      userId: row.goals?.userId ?? row.id,
      dailyCalories: row.goals?.dailyCalories ?? 2200,
      dailyCarbsG: row.goals?.dailyCarbsG ?? 275,
      dailyFatG: row.goals?.dailyFatG ?? 73,
      dailyProteinG: row.goals?.dailyProteinG ?? 165,
      updatedAt: row.goals?.updatedAt ?? new Date(),
    },
  }
}

// ─── Day Logs ─────────────────────────────────────────────────────────────────

/** Retorna todos os DayLogs do mês atual (mesma assinatura que getMockDayLogs) */
export async function getDayLogs(): Promise<DayLog[]> {
  const today = new Date()
  const firstOfMonth = toLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1))
  const lastOfMonth = toLocalDateString(new Date(today.getFullYear(), today.getMonth() + 1, 0))

  const rows = await db.query.dayLogs.findMany({
    where: and(
      eq(dayLogs.userId, CURRENT_USER_ID),
      gte(dayLogs.date, firstOfMonth),
      lte(dayLogs.date, lastOfMonth),
    ),
    with: {
      mealEntries: {
        with: { foodItems: true },
      },
    },
    orderBy: [dayLogs.date],
  })

  return rows.map(rowToDayLog)
}

/** Retorna um DayLog específico por data YYYY-MM-DD (mesma assinatura que getMockDayLog) */
export async function getDayLog(date: string): Promise<DayLog | null> {
  const row = await db.query.dayLogs.findFirst({
    where: and(eq(dayLogs.userId, CURRENT_USER_ID), eq(dayLogs.date, date)),
    with: {
      mealEntries: {
        with: { foodItems: true },
      },
    },
  })

  return row ? rowToDayLog(row) : null
}

/** Retorna o DayLog de hoje (mesma assinatura que getMockTodayLog) */
export async function getTodayLog(): Promise<DayLog | null> {
  const today = toLocalDateString(new Date())
  return getDayLog(today)
}

// ─── Calendário ───────────────────────────────────────────────────────────────

/** Retorna os dados do mês para o grid do calendário 7×5 (mesma assinatura que getMockCalendarMonth) */
export async function getCalendarMonth(year: number, month: number): Promise<CalendarMonth> {
  // Busca os day_logs do mês solicitado (month é 1-indexed aqui)
  const firstOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const lastOfMonth = toLocalDateString(new Date(year, month, 0)) // month sem -1 = próximo mês dia 0 = último dia do mês

  const rows = await db.query.dayLogs.findMany({
    where: and(
      eq(dayLogs.userId, CURRENT_USER_ID),
      gte(dayLogs.date, firstOfMonth),
      lte(dayLogs.date, lastOfMonth),
    ),
    with: {
      mealEntries: {
        with: { foodItems: true },
      },
    },
    orderBy: [dayLogs.date],
  })

  const logMap = new Map<string, DayLog>(rows.map((r) => [r.date, rowToDayLog(r)]))

  // Montar grid 7×5 (42 células) começando na segunda-feira da semana do dia 1
  const firstDay = new Date(year, month - 1, 1)
  // 0=Dom,1=Seg,...,6=Sab → normalizar para 0=Seg,...,6=Dom
  const firstDow = (firstDay.getDay() + 6) % 7
  const gridStart = new Date(year, month - 1, 1 - firstDow)

  const today = toLocalDateString(new Date())
  const days: CalendarDay[] = []

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart)
    cellDate.setDate(gridStart.getDate() + i)
    const dateStr = toLocalDateString(cellDate)
    const isCurrentMonth = cellDate.getMonth() === month - 1 && cellDate.getFullYear() === year

    days.push({
      date: dateStr,
      isCurrentMonth,
      isToday: dateStr === today,
      dayLog: logMap.get(dateStr) ?? null,
    })
  }

  return { year, month, days }
}

// ─── Gráfico ──────────────────────────────────────────────────────────────────

/** Retorna os últimos N dias como pontos do gráfico Recharts (mesma assinatura que getMockChartData) */
export async function getChartData(days = 14): Promise<CalorieChartPoint[]> {
  const rows = await db.query.dayLogs.findMany({
    where: and(eq(dayLogs.userId, CURRENT_USER_ID), ne(dayLogs.calorieStatus, 'no_data')),
    // Apenas colunas necessárias — sem joins para performance
    columns: {
      id: true,
      date: true,
      calories: true,
      calorieStatus: true,
    },
    orderBy: [dayLogs.date],
  })

  const user = await getUser()
  const recent = rows.slice(-days)

  return recent.map((row) => {
    const dateObj = new Date(row.date + 'T12:00:00Z')
    const label = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

    return {
      label,
      date: row.date,
      consumed: row.calories,
      maintenance: user.goals.dailyCalories,
      delta: row.calories - user.goals.dailyCalories,
      calorieStatus: row.calorieStatus as CalorieStatus,
    }
  })
}

/** Retorna anotações contextuais para os dias de maior variação (mesma assinatura que getMockChartAnnotations) */
export async function getChartAnnotations(): Promise<ChartAnnotation[]> {
  const chartPoints = await getChartData(14)
  const annotations: ChartAnnotation[] = []

  for (const point of chartPoints) {
    if (point.calorieStatus === 'surplus') {
      const log = await getDayLog(point.date)
      if (!log || log.meals.length === 0) continue

      const mealWithMostCals = log.meals.reduce((a, b) =>
        a.totals.calories > b.totals.calories ? a : b,
      )
      const mealLabel =
        mealWithMostCals.type.charAt(0).toUpperCase() + mealWithMostCals.type.slice(1)
      const dateObj = new Date(point.date + 'T12:00:00Z')
      const dayLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })

      annotations.push({
        date: point.date,
        label: `Excesso no ${mealLabel} — ${dayLabel}`,
        calorieStatus: point.calorieStatus,
      })
    }
  }

  return annotations
}

// ─── Tool-callable mutations ───────────────────────────────────────────────────

/** Calcula calorieStatus a partir dos totais e das metas do usuário */
export function computeCalorieStatus(calories: number, goalCalories: number): string {
  const ratio = calories / goalCalories
  if (calories === 0) return 'no_data'
  if (ratio < CALORIE_STATUS_THRESHOLDS.severeDeficit) return 'severe_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.moderateDeficit) return 'moderate_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.balanced) return 'balanced'
  if (ratio < CALORIE_STATUS_THRESHOLDS.slightSurplus) return 'slight_surplus'
  return 'surplus'
}

/**
 * Busca DayLogs num intervalo de datas (máximo 30 dias).
 * Usado pelas tools do Chat IA para consultar histórico estendido.
 */
export async function getDayLogRange(from: string, to: string): Promise<DayLog[]> {
  const fromDate = new Date(from + 'T00:00:00Z')
  const toDate = new Date(to + 'T00:00:00Z')
  const diffMs = toDate.getTime() - fromDate.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    throw new Error('[dal] getDayLogRange: "from" deve ser anterior ou igual a "to".')
  }
  if (diffDays > 30) {
    throw new Error('[dal] getDayLogRange: máximo de 30 dias por requisição.')
  }

  const rows = await db.query.dayLogs.findMany({
    where: and(eq(dayLogs.userId, CURRENT_USER_ID), gte(dayLogs.date, from), lte(dayLogs.date, to)),
    with: {
      mealEntries: {
        with: { foodItems: true },
      },
    },
    orderBy: [dayLogs.date],
  })

  return rows.map(rowToDayLog)
}

/** Payload de entrada para upsertMealEntry */
export interface UpsertMealInput {
  /** Data no formato YYYY-MM-DD */
  date: string
  mealType: MealType
  items: Array<{
    name: string
    quantityG: number
    calories: number
    carbsG: number
    fatG: number
    proteinG: number
  }>
}

/**
 * Cria ou substitui uma refeição num dia específico.
 * - Se o day_log não existir, cria um novo.
 * - Se já existir uma refeição do mesmo tipo naquele dia, apaga e recria.
 * - Recalcula e persiste os totais + calorieStatus do day_log.
 */
export async function upsertMealEntry(input: UpsertMealInput): Promise<DayLog> {
  const { date, mealType, items } = input

  const user = await getUser()

  // 1. Busca ou cria o day_log para a data
  let existingLog = await db.query.dayLogs.findFirst({
    where: and(eq(dayLogs.userId, CURRENT_USER_ID), eq(dayLogs.date, date)),
  })

  const dayLogId = existingLog?.id ?? `dl_${CURRENT_USER_ID}_${date}`

  if (!existingLog) {
    await db.insert(dayLogs).values({
      id: dayLogId,
      userId: CURRENT_USER_ID,
      date,
      calories: 0,
      carbsG: 0,
      fatG: 0,
      proteinG: 0,
      calorieStatus: 'no_data',
      notes: null,
    })
    existingLog = {
      id: dayLogId,
      userId: CURRENT_USER_ID,
      date,
      calories: 0,
      carbsG: 0,
      fatG: 0,
      proteinG: 0,
      calorieStatus: 'no_data',
      notes: null,
    }
  }

  // 2. Remove refeição existente do mesmo tipo (upsert = delete + insert)
  const existingMeal = await db.query.mealEntries.findFirst({
    where: and(eq(mealEntries.dayLogId, dayLogId), eq(mealEntries.type, mealType)),
  })
  if (existingMeal) {
    // food_items são cascade-deleted pelo FK
    await db.delete(mealEntries).where(eq(mealEntries.id, existingMeal.id))
  }

  // 3. Insere nova meal_entry + food_items
  const mealId = crypto.randomUUID()
  await db.insert(mealEntries).values({
    id: mealId,
    dayLogId,
    type: mealType,
    loggedAt: new Date(),
  })

  if (items.length > 0) {
    await db.insert(foodItems).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        mealEntryId: mealId,
        name: item.name,
        quantityG: item.quantityG,
        calories: item.calories,
        carbsG: item.carbsG,
        fatG: item.fatG,
        proteinG: item.proteinG,
      })),
    )
  }

  // 4. Recalcula totais do day_log via SQL agregado (todas as meals do dia)
  const totalsResult = await db
    .select({
      totalCalories: sql<number>`coalesce(sum(${foodItems.calories}), 0)`,
      totalCarbsG: sql<number>`coalesce(sum(${foodItems.carbsG}), 0)`,
      totalFatG: sql<number>`coalesce(sum(${foodItems.fatG}), 0)`,
      totalProteinG: sql<number>`coalesce(sum(${foodItems.proteinG}), 0)`,
    })
    .from(mealEntries)
    .leftJoin(foodItems, eq(foodItems.mealEntryId, mealEntries.id))
    .where(eq(mealEntries.dayLogId, dayLogId))

  const totals = totalsResult[0]
  const newCalories = Number(totals.totalCalories)
  const newCarbsG = Number(totals.totalCarbsG)
  const newFatG = Number(totals.totalFatG)
  const newProteinG = Number(totals.totalProteinG)
  const newStatus = computeCalorieStatus(newCalories, user.goals.dailyCalories)

  await db
    .update(dayLogs)
    .set({
      calories: newCalories,
      carbsG: newCarbsG,
      fatG: newFatG,
      proteinG: newProteinG,
      calorieStatus: newStatus,
    })
    .where(eq(dayLogs.id, dayLogId))

  // 5. Retorna o DayLog atualizado
  const updated = await getDayLog(date)
  if (!updated) throw new Error('[dal] upsertMealEntry: falha ao buscar DayLog após update.')
  return updated
}

/**
 * Remove uma refeição pelo seu ID e recalcula os totais do day_log.
 */
export async function deleteMealEntry(mealEntryId: string): Promise<DayLog> {
  // 1. Busca a meal para obter o dayLogId
  const meal = await db.query.mealEntries.findFirst({
    where: eq(mealEntries.id, mealEntryId),
    with: { dayLog: true },
  })

  if (!meal) {
    throw new Error(`[dal] deleteMealEntry: meal_entry_id "${mealEntryId}" não encontrado.`)
  }

  const { dayLogId } = meal
  const date = meal.dayLog.date

  // 2. Remove a meal (food_items são cascade-deleted)
  await db.delete(mealEntries).where(eq(mealEntries.id, mealEntryId))

  // 3. Recalcula totais
  const user = await getUser()
  const totalsResult = await db
    .select({
      totalCalories: sql<number>`coalesce(sum(${foodItems.calories}), 0)`,
      totalCarbsG: sql<number>`coalesce(sum(${foodItems.carbsG}), 0)`,
      totalFatG: sql<number>`coalesce(sum(${foodItems.fatG}), 0)`,
      totalProteinG: sql<number>`coalesce(sum(${foodItems.proteinG}), 0)`,
    })
    .from(mealEntries)
    .leftJoin(foodItems, eq(foodItems.mealEntryId, mealEntries.id))
    .where(eq(mealEntries.dayLogId, dayLogId))

  const totals = totalsResult[0]
  const newCalories = Number(totals.totalCalories)
  const newCarbsG = Number(totals.totalCarbsG)
  const newFatG = Number(totals.totalFatG)
  const newProteinG = Number(totals.totalProteinG)
  const newStatus = computeCalorieStatus(newCalories, user.goals.dailyCalories)

  await db
    .update(dayLogs)
    .set({
      calories: newCalories,
      carbsG: newCarbsG,
      fatG: newFatG,
      proteinG: newProteinG,
      calorieStatus: newStatus,
    })
    .where(eq(dayLogs.id, dayLogId))

  // 4. Retorna o DayLog atualizado
  const updated = await getDayLog(date)
  if (!updated) throw new Error('[dal] deleteMealEntry: falha ao buscar DayLog após delete.')
  return updated
}
