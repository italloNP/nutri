// =============================================================================
// lib/db/seed.ts
// Script de seed — popula o banco de dados com os dados de desenvolvimento.
//
// Execução: npm run db:seed
//
// Reutiliza a mesma lógica de geração de dados do mock-data.ts para
// garantir consistência entre o ambiente de dev (mock) e o DB real.
// Este script é idempotente: executa upsert, nunca duplica dados.
// =============================================================================
import { config } from 'dotenv'
import { resolve } from 'path'

// Carrega .env.local explicitamente (dotenv/config só lê .env)
config({ path: resolve(process.cwd(), '.env.local') })

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_MACRO_GOALS,
  CALORIE_STATUS_THRESHOLDS,
} from '../../constants/nutrition'
import { CURRENT_USER_ID } from '../current-user'
import type { CalorieStatus } from '../../constants/nutrition'

// ─── DB connection (seed-only, max 1 connection) ─────────────────────────────

const client = postgres(process.env.DATABASE_URL!, { max: 1 })
const db = drizzle(client, { schema })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return toLocalDateString(d)
}

function resolveCalorieStatus(consumed: number, goal: number): CalorieStatus {
  const ratio = consumed / goal
  if (consumed === 0) return 'no_data'
  if (ratio < CALORIE_STATUS_THRESHOLDS.severeDeficit) return 'severe_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.moderateDeficit) return 'moderate_deficit'
  if (ratio < CALORIE_STATUS_THRESHOLDS.balanced) return 'balanced'
  if (ratio < CALORIE_STATUS_THRESHOLDS.slightSurplus) return 'slight_surplus'
  return 'surplus'
}

// ─── Food Library ─────────────────────────────────────────────────────────────

interface FoodData {
  name: string
  quantityG: number
  calories: number
  carbsG: number
  fatG: number
  proteinG: number
}

const F = {
  oatmeal: (g = 100): FoodData => ({
    name: 'Aveia em flocos',
    quantityG: g,
    calories: Math.round((g / 100) * 389),
    carbsG: Math.round((g / 100) * 67),
    fatG: Math.round((g / 100) * 7),
    proteinG: Math.round((g / 100) * 17),
  }),
  banana: (g = 120): FoodData => ({
    name: 'Banana',
    quantityG: g,
    calories: Math.round((g / 100) * 89),
    carbsG: Math.round((g / 100) * 23),
    fatG: 0,
    proteinG: Math.round((g / 100) * 1),
  }),
  eggs: (qty = 2): FoodData => ({
    name: `Ovos mexidos (${qty} un)`,
    quantityG: qty * 50,
    calories: qty * 78,
    carbsG: qty * 1,
    fatG: qty * 5,
    proteinG: qty * 6,
  }),
  whey: (g = 30): FoodData => ({
    name: 'Whey Protein',
    quantityG: g,
    calories: Math.round((g / 30) * 120),
    carbsG: Math.round((g / 30) * 3),
    fatG: Math.round((g / 30) * 2),
    proteinG: Math.round((g / 30) * 24),
  }),
  chicken: (g = 200): FoodData => ({
    name: 'Peito de frango grelhado',
    quantityG: g,
    calories: Math.round((g / 100) * 165),
    carbsG: 0,
    fatG: Math.round((g / 100) * 4),
    proteinG: Math.round((g / 100) * 31),
  }),
  rice: (g = 200): FoodData => ({
    name: 'Arroz branco cozido',
    quantityG: g,
    calories: Math.round((g / 100) * 130),
    carbsG: Math.round((g / 100) * 28),
    fatG: Math.round((g / 100) * 0.3),
    proteinG: Math.round((g / 100) * 2.7),
  }),
  beans: (g = 150): FoodData => ({
    name: 'Feijão carioca cozido',
    quantityG: g,
    calories: Math.round((g / 100) * 77),
    carbsG: Math.round((g / 100) * 14),
    fatG: Math.round((g / 100) * 0.5),
    proteinG: Math.round((g / 100) * 5),
  }),
  salad: (g = 80): FoodData => ({
    name: 'Salada verde',
    quantityG: g,
    calories: Math.round((g / 100) * 20),
    carbsG: Math.round((g / 100) * 4),
    fatG: 0,
    proteinG: Math.round((g / 100) * 2),
  }),
  salmon: (g = 180): FoodData => ({
    name: 'Salmão assado',
    quantityG: g,
    calories: Math.round((g / 100) * 208),
    carbsG: 0,
    fatG: Math.round((g / 100) * 13),
    proteinG: Math.round((g / 100) * 20),
  }),
  sweetPotato: (g = 150): FoodData => ({
    name: 'Batata doce cozida',
    quantityG: g,
    calories: Math.round((g / 100) * 86),
    carbsG: Math.round((g / 100) * 20),
    fatG: 0,
    proteinG: Math.round((g / 100) * 2),
  }),
  yogurt: (g = 170): FoodData => ({
    name: 'Iogurte grego natural',
    quantityG: g,
    calories: Math.round((g / 100) * 97),
    carbsG: Math.round((g / 100) * 4),
    fatG: Math.round((g / 100) * 5),
    proteinG: Math.round((g / 100) * 9),
  }),
  almonds: (g = 28): FoodData => ({
    name: 'Amêndoas',
    quantityG: g,
    calories: Math.round((g / 100) * 579),
    carbsG: Math.round((g / 100) * 22),
    fatG: Math.round((g / 100) * 50),
    proteinG: Math.round((g / 100) * 21),
  }),
  pizza: (g = 300): FoodData => ({
    name: 'Pizza (2 fatias)',
    quantityG: g,
    calories: Math.round((g / 100) * 266),
    carbsG: Math.round((g / 100) * 33),
    fatG: Math.round((g / 100) * 10),
    proteinG: Math.round((g / 100) * 11),
  }),
  beer: (): FoodData => ({
    name: 'Cerveja lager (350ml)',
    quantityG: 350,
    calories: 154,
    carbsG: 13,
    fatG: 0,
    proteinG: 2,
  }),
}

function sum(items: FoodData[]) {
  return items.reduce(
    (a, b) => ({
      calories: a.calories + b.calories,
      carbsG: a.carbsG + b.carbsG,
      fatG: a.fatG + b.fatG,
      proteinG: a.proteinG + b.proteinG,
    }),
    { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
  )
}

// ─── Meal Profiles ────────────────────────────────────────────────────────────

type DayProfile = 'balanced' | 'deficit' | 'surplus' | 'cheat' | 'no_data'

interface MealData {
  type: string
  loggedAt: string
  items: FoodData[]
}

function buildMeals(dateStr: string, profile: DayProfile): MealData[] {
  if (profile === 'no_data') return []

  const profiles: Record<Exclude<DayProfile, 'no_data'>, MealData[]> = {
    balanced: [
      {
        type: 'breakfast',
        loggedAt: `${dateStr}T07:30:00Z`,
        items: [F.oatmeal(80), F.banana(100), F.eggs(2)],
      },
      {
        type: 'lunch',
        loggedAt: `${dateStr}T12:30:00Z`,
        items: [F.chicken(200), F.rice(180), F.beans(120), F.salad()],
      },
      { type: 'snack', loggedAt: `${dateStr}T16:00:00Z`, items: [F.yogurt(), F.almonds()] },
      { type: 'dinner', loggedAt: `${dateStr}T19:30:00Z`, items: [F.salmon(150), F.sweetPotato()] },
    ],
    deficit: [
      { type: 'breakfast', loggedAt: `${dateStr}T08:00:00Z`, items: [F.eggs(2), F.salad(60)] },
      { type: 'lunch', loggedAt: `${dateStr}T13:00:00Z`, items: [F.chicken(150), F.salad(100)] },
      { type: 'dinner', loggedAt: `${dateStr}T20:00:00Z`, items: [F.yogurt(150), F.almonds(20)] },
    ],
    surplus: [
      {
        type: 'breakfast',
        loggedAt: `${dateStr}T07:00:00Z`,
        items: [F.oatmeal(120), F.banana(150), F.eggs(3), F.whey()],
      },
      {
        type: 'lunch',
        loggedAt: `${dateStr}T12:00:00Z`,
        items: [F.chicken(300), F.rice(250), F.beans(180)],
      },
      { type: 'snack', loggedAt: `${dateStr}T15:30:00Z`, items: [F.yogurt(), F.almonds(40)] },
      {
        type: 'dinner',
        loggedAt: `${dateStr}T19:00:00Z`,
        items: [F.salmon(200), F.sweetPotato(180), F.rice(100)],
      },
    ],
    cheat: [
      { type: 'breakfast', loggedAt: `${dateStr}T09:30:00Z`, items: [F.eggs(3), F.banana()] },
      { type: 'lunch', loggedAt: `${dateStr}T13:30:00Z`, items: [F.pizza()] },
      { type: 'snack', loggedAt: `${dateStr}T16:30:00Z`, items: [F.almonds(40), F.yogurt()] },
      { type: 'dinner', loggedAt: `${dateStr}T20:30:00Z`, items: [F.pizza(200), F.beer()] },
    ],
  }

  return profiles[profile]
}

// ─── DAY_PROFILES (30 dias do mês) ───────────────────────────────────────────

const DAY_PROFILES: DayProfile[] = [
  'balanced',
  'balanced',
  'balanced',
  'surplus',
  'deficit',
  'cheat',
  'cheat',
  'deficit',
  'balanced',
  'balanced',
  'surplus',
  'balanced',
  'deficit',
  'cheat',
  'no_data',
  'deficit',
  'balanced',
  'balanced',
  'surplus',
  'balanced',
  'deficit',
  'cheat',
  'cheat',
  'surplus',
  'balanced',
  'balanced',
  'deficit',
  'balanced',
  'surplus',
  'balanced',
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  // 1. Upsert user
  console.log('👤 Inserindo usuário Ana Carolina...')
  await db
    .insert(schema.users)
    .values({
      id: CURRENT_USER_ID,
      name: 'Ana Carolina',
      email: 'ana@nutri.app',
      avatarUrl: null,
      createdAt: new Date('2025-01-15T10:00:00Z'),
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { name: 'Ana Carolina', email: 'ana@nutri.app' },
    })

  // 2. Upsert user_goals
  console.log('🎯 Inserindo metas nutricionais...')
  await db
    .insert(schema.userGoals)
    .values({
      userId: CURRENT_USER_ID,
      dailyCalories: DEFAULT_CALORIE_GOAL,
      dailyCarbsG: DEFAULT_MACRO_GOALS.carbsG,
      dailyFatG: DEFAULT_MACRO_GOALS.fatG,
      dailyProteinG: DEFAULT_MACRO_GOALS.proteinG,
    })
    .onConflictDoUpdate({
      target: schema.userGoals.userId,
      set: {
        dailyCalories: DEFAULT_CALORIE_GOAL,
        dailyCarbsG: DEFAULT_MACRO_GOALS.carbsG,
        dailyFatG: DEFAULT_MACRO_GOALS.fatG,
        dailyProteinG: DEFAULT_MACRO_GOALS.proteinG,
      },
    })

  // 3. Gerar e inserir 30 day_logs com meal_entries e food_items
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  let logsInserted = 0

  for (let i = 0; i < DAY_PROFILES.length; i++) {
    const profile = DAY_PROFILES[i]
    const dateStr = addDays(firstOfMonth, i)
    const dayLogId = `log_${dateStr.replace(/-/g, '_')}`

    const mealsData = buildMeals(dateStr, profile)

    // Calcular totais do dia
    const allItems = mealsData.flatMap((m) => m.items)
    const totals = sum(allItems)
    const calorieStatus = resolveCalorieStatus(totals.calories, DEFAULT_CALORIE_GOAL)

    // Upsert day_log
    await db
      .insert(schema.dayLogs)
      .values({
        id: dayLogId,
        userId: CURRENT_USER_ID,
        date: dateStr,
        calories: totals.calories,
        carbsG: totals.carbsG,
        fatG: totals.fatG,
        proteinG: totals.proteinG,
        calorieStatus,
        notes: null,
      })
      .onConflictDoUpdate({
        target: schema.dayLogs.id,
        set: {
          calories: totals.calories,
          carbsG: totals.carbsG,
          fatG: totals.fatG,
          proteinG: totals.proteinG,
          calorieStatus,
        },
      })

    // Inserir meal_entries e food_items para cada refeição
    for (const meal of mealsData) {
      const mealId = `meal_${dateStr.replace(/-/g, '_')}_${meal.type}`

      await db
        .insert(schema.mealEntries)
        .values({
          id: mealId,
          dayLogId,
          type: meal.type,
          loggedAt: new Date(meal.loggedAt),
        })
        .onConflictDoUpdate({
          target: schema.mealEntries.id,
          set: { type: meal.type },
        })

      // Deletar food_items antigos para este meal (garante idempotência)
      // e reinserir
      for (const item of meal.items) {
        const itemId = `item_${generateId()}`
        // Note: food_items não tem unique constraint além do id, então usamos
        // uma estratégia diferente — deletamos e reinserimos pelo mealEntryId
        // (feito via onConflictDoNothing com id gerado)
        await db
          .insert(schema.foodItems)
          .values({
            id: itemId,
            mealEntryId: mealId,
            name: item.name,
            quantityG: item.quantityG,
            calories: item.calories,
            carbsG: item.carbsG,
            fatG: item.fatG,
            proteinG: item.proteinG,
          })
          .onConflictDoNothing()
      }
    }

    logsInserted++
    process.stdout.write(`  ✓ ${dateStr} [${profile.padEnd(8)}] ${totals.calories} kcal\n`)
  }

  console.log(`\n✅ Seed concluído! ${logsInserted} day_logs inseridos.\n`)
  await client.end()
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
