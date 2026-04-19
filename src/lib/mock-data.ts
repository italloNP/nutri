// =============================================================================
// lib/mock-data.ts
// Provedor de mock data consistente para desenvolvimento.
//
// FLUXO:
// 1. Este módulo é a única fonte de dados nas Etapas 2–5.
// 2. Na Etapa 6, cada função aqui será substituída pela query Drizzle equivalente.
// 3. A assinatura de retorno (tipos) permanece idêntica — zero mudança nos consumers.
//
// ESTRUTURA DOS DADOS:
// - 1 usuário fixo ("Ana Carolina")
// - 30 dias de registros (mês atual) com variação realista de calorias/macros
// - Anotações no gráfico nos dias de maior variação
// =============================================================================

import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_MACRO_GOALS,
  CALORIE_STATUS_THRESHOLDS,
  type CalorieStatus,
} from '@/constants/nutrition'
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
} from '@/types'

// =============================================================================
// UTILITÁRIOS INTERNOS
// =============================================================================

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

/** Adiciona dias a uma data e retorna string ISO (YYYY-MM-DD) */
function addDays(baseDate: Date, days: number): string {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** Calcula totais de macros a partir de um array de FoodItems */
function sumMacros(items: FoodItem[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      carbsG: acc.carbsG + item.carbsG,
      fatG: acc.fatG + item.fatG,
      proteinG: acc.proteinG + item.proteinG,
    }),
    { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
  )
}

/** Determina o status calórico de um dia vs. a meta de manutenção */
function resolveCalorieStatus(consumed: number, goal: number): CalorieStatus {
  const ratio = consumed / goal
  if (consumed === 0) return 'no_data'
  if (ratio < CALORIE_STATUS_THRESHOLDS.severeDeficit) return 'severe_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.moderateDeficit) return 'moderate_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.balanced) return 'balanced'
  if (ratio < CALORIE_STATUS_THRESHOLDS.slightSurplus) return 'slight_surplus'
  return 'surplus'
}

// =============================================================================
// USUÁRIO MOCK
// =============================================================================

export const MOCK_USER: User = {
  id: 'usr_mock_001',
  name: 'Ana Carolina',
  email: 'ana@nutri.app',
  avatarUrl: null,
  createdAt: new Date('2025-01-15T10:00:00Z'),
  goals: {
    userId: 'usr_mock_001',
    dailyCalories: DEFAULT_CALORIE_GOAL,
    dailyCarbsG: DEFAULT_MACRO_GOALS.carbsG,
    dailyFatG: DEFAULT_MACRO_GOALS.fatG,
    dailyProteinG: DEFAULT_MACRO_GOALS.proteinG,
    updatedAt: new Date('2025-08-01T00:00:00Z'),
  },
}

// =============================================================================
// BIBLIOTECA DE ALIMENTOS MOCK
// (usada para montar refeições variadas)
// =============================================================================

const FOOD_LIBRARY = {
  // Café da manhã
  oatmeal: (g = 100): FoodItem => ({
    id: generateId(),
    name: 'Aveia em flocos',
    quantityG: g,
    calories: Math.round((g / 100) * 389),
    carbsG: Math.round((g / 100) * 67),
    fatG: Math.round((g / 100) * 7),
    proteinG: Math.round((g / 100) * 17),
  }),
  banana: (g = 120): FoodItem => ({
    id: generateId(),
    name: 'Banana',
    quantityG: g,
    calories: Math.round((g / 100) * 89),
    carbsG: Math.round((g / 100) * 23),
    fatG: 0,
    proteinG: Math.round((g / 100) * 1),
  }),
  eggs: (qty = 2): FoodItem => ({
    id: generateId(),
    name: `Ovos mexidos (${qty} un)`,
    quantityG: qty * 50,
    calories: qty * 78,
    carbsG: qty * 1,
    fatG: qty * 5,
    proteinG: qty * 6,
  }),
  wheyProtein: (g = 30): FoodItem => ({
    id: generateId(),
    name: 'Whey Protein',
    quantityG: g,
    calories: Math.round((g / 30) * 120),
    carbsG: Math.round((g / 30) * 3),
    fatG: Math.round((g / 30) * 2),
    proteinG: Math.round((g / 30) * 24),
  }),
  // Almoço / Jantar
  chickenBreast: (g = 200): FoodItem => ({
    id: generateId(),
    name: 'Peito de frango grelhado',
    quantityG: g,
    calories: Math.round((g / 100) * 165),
    carbsG: 0,
    fatG: Math.round((g / 100) * 4),
    proteinG: Math.round((g / 100) * 31),
  }),
  rice: (g = 200): FoodItem => ({
    id: generateId(),
    name: 'Arroz branco cozido',
    quantityG: g,
    calories: Math.round((g / 100) * 130),
    carbsG: Math.round((g / 100) * 28),
    fatG: Math.round((g / 100) * 0.3),
    proteinG: Math.round((g / 100) * 2.7),
  }),
  beans: (g = 150): FoodItem => ({
    id: generateId(),
    name: 'Feijão carioca cozido',
    quantityG: g,
    calories: Math.round((g / 100) * 77),
    carbsG: Math.round((g / 100) * 14),
    fatG: Math.round((g / 100) * 0.5),
    proteinG: Math.round((g / 100) * 5),
  }),
  salad: (g = 80): FoodItem => ({
    id: generateId(),
    name: 'Salada verde',
    quantityG: g,
    calories: Math.round((g / 100) * 20),
    carbsG: Math.round((g / 100) * 4),
    fatG: 0,
    proteinG: Math.round((g / 100) * 2),
  }),
  salmon: (g = 180): FoodItem => ({
    id: generateId(),
    name: 'Salmão assado',
    quantityG: g,
    calories: Math.round((g / 100) * 208),
    carbsG: 0,
    fatG: Math.round((g / 100) * 13),
    proteinG: Math.round((g / 100) * 20),
  }),
  sweetPotato: (g = 150): FoodItem => ({
    id: generateId(),
    name: 'Batata doce cozida',
    quantityG: g,
    calories: Math.round((g / 100) * 86),
    carbsG: Math.round((g / 100) * 20),
    fatG: 0,
    proteinG: Math.round((g / 100) * 2),
  }),
  // Lanches
  greekyogurt: (g = 170): FoodItem => ({
    id: generateId(),
    name: 'Iogurte grego natural',
    quantityG: g,
    calories: Math.round((g / 100) * 97),
    carbsG: Math.round((g / 100) * 4),
    fatG: Math.round((g / 100) * 5),
    proteinG: Math.round((g / 100) * 9),
  }),
  almonds: (g = 28): FoodItem => ({
    id: generateId(),
    name: 'Amêndoas',
    quantityG: g,
    calories: Math.round((g / 100) * 579),
    carbsG: Math.round((g / 100) * 22),
    fatG: Math.round((g / 100) * 50),
    proteinG: Math.round((g / 100) * 21),
  }),
  pizza: (g = 300): FoodItem => ({
    id: generateId(),
    name: 'Pizza (2 fatias)',
    quantityG: g,
    calories: Math.round((g / 100) * 266),
    carbsG: Math.round((g / 100) * 33),
    fatG: Math.round((g / 100) * 10),
    proteinG: Math.round((g / 100) * 11),
  }),
  beer: (g = 350): FoodItem => ({
    id: generateId(),
    name: 'Cerveja lager (350ml)',
    quantityG: g,
    calories: 154,
    carbsG: 13,
    fatG: 0,
    proteinG: 2,
  }),
}

// =============================================================================
// GERADOR DE REFEIÇÕES VARIADAS
// =============================================================================

type DayProfile = 'balanced' | 'deficit' | 'surplus' | 'cheat' | 'no_data'

function buildMeals(dayLogId: string, profile: DayProfile, dateStr: string): MealEntry[] {
  if (profile === 'no_data') return []

  const profiles: Record<Exclude<DayProfile, 'no_data'>, MealEntry[]> = {
    balanced: [
      {
        id: generateId(),
        dayLogId,
        type: 'breakfast',
        loggedAt: `${dateStr}T07:30:00Z`,
        items: [FOOD_LIBRARY.oatmeal(80), FOOD_LIBRARY.banana(100), FOOD_LIBRARY.eggs(2)],
        totals: sumMacros([
          FOOD_LIBRARY.oatmeal(80),
          FOOD_LIBRARY.banana(100),
          FOOD_LIBRARY.eggs(2),
        ]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'lunch',
        loggedAt: `${dateStr}T12:30:00Z`,
        items: [
          FOOD_LIBRARY.chickenBreast(200),
          FOOD_LIBRARY.rice(180),
          FOOD_LIBRARY.beans(120),
          FOOD_LIBRARY.salad(),
        ],
        totals: sumMacros([
          FOOD_LIBRARY.chickenBreast(200),
          FOOD_LIBRARY.rice(180),
          FOOD_LIBRARY.beans(120),
          FOOD_LIBRARY.salad(),
        ]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'snack',
        loggedAt: `${dateStr}T16:00:00Z`,
        items: [FOOD_LIBRARY.greekyogurt(), FOOD_LIBRARY.almonds()],
        totals: sumMacros([FOOD_LIBRARY.greekyogurt(), FOOD_LIBRARY.almonds()]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'dinner',
        loggedAt: `${dateStr}T19:30:00Z`,
        items: [FOOD_LIBRARY.salmon(150), FOOD_LIBRARY.sweetPotato()],
        totals: sumMacros([FOOD_LIBRARY.salmon(150), FOOD_LIBRARY.sweetPotato()]),
      },
    ],
    deficit: [
      {
        id: generateId(),
        dayLogId,
        type: 'breakfast',
        loggedAt: `${dateStr}T08:00:00Z`,
        items: [FOOD_LIBRARY.eggs(2), FOOD_LIBRARY.salad(60)],
        totals: sumMacros([FOOD_LIBRARY.eggs(2), FOOD_LIBRARY.salad(60)]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'lunch',
        loggedAt: `${dateStr}T13:00:00Z`,
        items: [FOOD_LIBRARY.chickenBreast(150), FOOD_LIBRARY.salad(100)],
        totals: sumMacros([FOOD_LIBRARY.chickenBreast(150), FOOD_LIBRARY.salad(100)]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'dinner',
        loggedAt: `${dateStr}T20:00:00Z`,
        items: [FOOD_LIBRARY.greekyogurt(150), FOOD_LIBRARY.almonds(20)],
        totals: sumMacros([FOOD_LIBRARY.greekyogurt(150), FOOD_LIBRARY.almonds(20)]),
      },
    ],
    surplus: [
      {
        id: generateId(),
        dayLogId,
        type: 'breakfast',
        loggedAt: `${dateStr}T07:00:00Z`,
        items: [
          FOOD_LIBRARY.oatmeal(120),
          FOOD_LIBRARY.banana(150),
          FOOD_LIBRARY.eggs(3),
          FOOD_LIBRARY.wheyProtein(),
        ],
        totals: sumMacros([
          FOOD_LIBRARY.oatmeal(120),
          FOOD_LIBRARY.banana(150),
          FOOD_LIBRARY.eggs(3),
          FOOD_LIBRARY.wheyProtein(),
        ]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'lunch',
        loggedAt: `${dateStr}T12:00:00Z`,
        items: [FOOD_LIBRARY.chickenBreast(300), FOOD_LIBRARY.rice(250), FOOD_LIBRARY.beans(180)],
        totals: sumMacros([
          FOOD_LIBRARY.chickenBreast(300),
          FOOD_LIBRARY.rice(250),
          FOOD_LIBRARY.beans(180),
        ]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'snack',
        loggedAt: `${dateStr}T15:30:00Z`,
        items: [FOOD_LIBRARY.greekyogurt(), FOOD_LIBRARY.almonds(40)],
        totals: sumMacros([FOOD_LIBRARY.greekyogurt(), FOOD_LIBRARY.almonds(40)]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'dinner',
        loggedAt: `${dateStr}T19:00:00Z`,
        items: [FOOD_LIBRARY.salmon(200), FOOD_LIBRARY.sweetPotato(180), FOOD_LIBRARY.rice(100)],
        totals: sumMacros([
          FOOD_LIBRARY.salmon(200),
          FOOD_LIBRARY.sweetPotato(180),
          FOOD_LIBRARY.rice(100),
        ]),
      },
    ],
    cheat: [
      {
        id: generateId(),
        dayLogId,
        type: 'breakfast',
        loggedAt: `${dateStr}T09:30:00Z`,
        items: [FOOD_LIBRARY.eggs(3), FOOD_LIBRARY.banana()],
        totals: sumMacros([FOOD_LIBRARY.eggs(3), FOOD_LIBRARY.banana()]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'lunch',
        loggedAt: `${dateStr}T13:30:00Z`,
        items: [FOOD_LIBRARY.pizza()],
        totals: sumMacros([FOOD_LIBRARY.pizza()]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'snack',
        loggedAt: `${dateStr}T16:30:00Z`,
        items: [FOOD_LIBRARY.almonds(40), FOOD_LIBRARY.greekyogurt()],
        totals: sumMacros([FOOD_LIBRARY.almonds(40), FOOD_LIBRARY.greekyogurt()]),
      },
      {
        id: generateId(),
        dayLogId,
        type: 'dinner',
        loggedAt: `${dateStr}T20:30:00Z`,
        items: [FOOD_LIBRARY.pizza(200), FOOD_LIBRARY.beer()],
        totals: sumMacros([FOOD_LIBRARY.pizza(200), FOOD_LIBRARY.beer()]),
      },
    ],
  }

  return profiles[profile]
}

// =============================================================================
// GERADOR DE DAY LOGS (30 DIAS)
// =============================================================================

/**
 * Padrão de dias do mês atual: cada índice (0 = 1º dia do mês)
 * recebe um perfil de alimentação para variação realista.
 */
const DAY_PROFILES: DayProfile[] = [
  'balanced', // 1
  'balanced', // 2
  'balanced', // 3
  'surplus', // 4
  'deficit', // 5
  'cheat', // 6  (fim de semana)
  'cheat', // 7  (fim de semana)
  'deficit', // 8
  'balanced', // 9
  'balanced', // 10
  'surplus', // 11
  'balanced', // 12
  'deficit', // 13
  'cheat', // 14 (fim de semana)
  'no_data', // 15 (fim de semana sem log)
  'deficit', // 16
  'balanced', // 17
  'balanced', // 18
  'surplus', // 19
  'balanced', // 20
  'deficit', // 21
  'cheat', // 22 (fim de semana)
  'cheat', // 23 (fim de semana)
  'surplus', // 24
  'balanced', // 25
  'balanced', // 26
  'deficit', // 27
  'balanced', // 28
  'surplus', // 29
  'balanced', // 30
]

function buildDayLogs(): DayLog[] {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return DAY_PROFILES.map((profile, index) => {
    const dateStr = addDays(firstOfMonth, index)
    const dayLogId = `log_${dateStr.replace(/-/g, '_')}`
    const meals = buildMeals(dayLogId, profile, dateStr)
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totals.calories,
        carbsG: acc.carbsG + meal.totals.carbsG,
        fatG: acc.fatG + meal.totals.fatG,
        proteinG: acc.proteinG + meal.totals.proteinG,
      }),
      { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
    )

    return {
      id: dayLogId,
      userId: MOCK_USER.id,
      date: dateStr,
      meals,
      totals,
      calorieStatus: resolveCalorieStatus(totals.calories, MOCK_USER.goals.dailyCalories),
      notes: null,
    }
  })
}

// =============================================================================
// DADOS PÚBLICOS (EXPORTADOS)
// =============================================================================

/** Todos os registros do mês (lazy-initialized, reutilizável) */
let _cachedDayLogs: DayLog[] | null = null

function getDayLogs(): DayLog[] {
  if (!_cachedDayLogs) {
    _cachedDayLogs = buildDayLogs()
  }
  return _cachedDayLogs
}

// -----------------------------------------------------------------------------
// Funções de acesso — mesma assinatura que as queries Drizzle da Etapa 6
// -----------------------------------------------------------------------------

/** Retorna todos os DayLogs do mês atual */
export function getMockDayLogs(): DayLog[] {
  return getDayLogs()
}

/** Retorna um DayLog específico por data (YYYY-MM-DD) */
export function getMockDayLog(date: string): DayLog | null {
  return getDayLogs().find((d) => d.date === date) ?? null
}

/** Retorna o DayLog de hoje */
export function getMockTodayLog(): DayLog | null {
  const today = new Date().toISOString().split('T')[0]
  return getMockDayLog(today)
}

/**
 * Retorna os últimos N dias como pontos para o gráfico Recharts.
 * Inclui apenas dias com dados (calorieStatus !== 'no_data').
 */
export function getMockChartData(days = 14): CalorieChartPoint[] {
  const logs = getDayLogs()
  const withData = logs.filter((d) => d.calorieStatus !== 'no_data')
  const recent = withData.slice(-days)

  return recent.map((log) => {
    const dateObj = new Date(log.date + 'T12:00:00Z')
    const label = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

    return {
      label,
      date: log.date,
      consumed: log.totals.calories,
      maintenance: MOCK_USER.goals.dailyCalories,
      delta: log.totals.calories - MOCK_USER.goals.dailyCalories,
      calorieStatus: log.calorieStatus,
    }
  })
}

/**
 * Retorna anotações contextuais para o gráfico (dias de maior variação).
 */
export function getMockChartAnnotations(): ChartAnnotation[] {
  const chartData = getMockChartData(14)
  const annotations: ChartAnnotation[] = []

  for (const point of chartData) {
    if (point.calorieStatus === 'surplus') {
      const log = getMockDayLog(point.date)
      const mealWithMostCals = log?.meals.reduce((a, b) =>
        a.totals.calories > b.totals.calories ? a : b,
      )
      const mealLabel =
        mealWithMostCals?.type === 'lunch'
          ? 'Almoço'
          : mealWithMostCals?.type === 'dinner'
            ? 'Jantar'
            : 'Lanche'

      annotations.push({
        date: point.date,
        label: `Excesso Calórico no ${mealLabel}`,
        calorieStatus: 'surplus',
      })
    } else if (point.calorieStatus === 'moderate_deficit') {
      annotations.push({
        date: point.date,
        label: 'Déficit Calórico',
        calorieStatus: 'moderate_deficit',
      })
    } else if (point.calorieStatus === 'balanced') {
      // Anotar somente o primeiro dia de equilíbrio perfeito como destaque
      const alreadyHasBalanced = annotations.some((a) => a.calorieStatus === 'balanced')
      if (!alreadyHasBalanced) {
        const log = getMockDayLog(point.date)
        const dinnerLog = log?.meals.find((m) => m.type === 'dinner')
        if (dinnerLog) {
          annotations.push({
            date: point.date,
            label: 'Equilíbrio Perfeito no Jantar',
            calorieStatus: 'balanced',
          })
        }
      }
    }
  }

  return annotations
}

/**
 * Constrói o grid do calendário (7×5) para um dado ano/mês.
 * Preenche dias do mês anterior/próximo para completar semanas.
 */
export function getMockCalendarMonth(year: number, month: number): CalendarMonth {
  const dayLogs = getDayLogs()
  const dayLogMap = new Map(dayLogs.map((d) => [d.date, d]))
  const todayStr = new Date().toISOString().split('T')[0]

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  // Dia da semana do primeiro dia (0=Dom → ajusta para 1=Seg como início)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days: CalendarDay[] = []

  // Dias do mês anterior para padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayLog: dayLogMap.get(dateStr) ?? null,
    })
  }

  // Dias do mês atual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month - 1, day)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayLog: dayLogMap.get(dateStr) ?? null,
    })
  }

  // Dias do próximo mês para completar as 5 linhas (35 células)
  const remaining = 35 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month, i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayLog: dayLogMap.get(dateStr) ?? null,
    })
  }

  return { year, month, days }
}
