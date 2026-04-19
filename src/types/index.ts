// =============================================================================
// types/index.ts
// Interfaces TypeScript exportáveis — fonte única de verdade para todo o projeto.
//
// REGRAS:
// - Nunca use `any`. Use `unknown` e faça narrowing explícito quando necessário.
// - Prefira `interface` para shapes de objetos (consistência com ESLint config).
// - Prefira `type` para uniões, interseções e aliases pontuais.
// =============================================================================

import type { MEAL_TYPES, CalorieStatus } from '@/constants/nutrition'

// =============================================================================
// DOMÍNIO: USUÁRIO
// =============================================================================

/**
 * Perfil completo do usuário autenticado.
 * Espelha a tabela `users` do banco de dados.
 */
export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Date
  goals: NutritionGoals
}

/**
 * Metas nutricionais personalizadas de um usuário.
 * Sobrescrevem as constantes de DEFAULT_* quando definidas.
 */
export interface NutritionGoals {
  userId: string
  /** Calorias diárias alvo em kcal */
  dailyCalories: number
  /** Carboidratos diários alvo em gramas */
  dailyCarbsG: number
  /** Gorduras diárias alvo em gramas */
  dailyFatG: number
  /** Proteínas diárias alvo em gramas */
  dailyProteinG: number
  updatedAt: Date
}

// =============================================================================
// DOMÍNIO: REFEIÇÕES E REGISTROS DIÁRIOS
// =============================================================================

/** Tipos de refeição suportados pelo sistema */
export type MealType = (typeof MEAL_TYPES)[number]

/**
 * Um item alimentar dentro de uma refeição.
 * Ex: "Frango grelhado, 150g"
 */
export interface FoodItem {
  id: string
  name: string
  /** Quantidade em gramas */
  quantityG: number
  /** Calorias totais para esta quantidade */
  calories: number
  carbsG: number
  fatG: number
  proteinG: number
}

/**
 * Uma refeição completa (ex: Almoço) com seus itens.
 */
export interface MealEntry {
  id: string
  dayLogId: string
  type: MealType
  /** Horário da refeição (ISO 8601) */
  loggedAt: string
  items: FoodItem[]
  /** Totais calculados: soma de todos os items */
  totals: MacroTotals
}

/**
 * Totais de macros e calorias — resultado da soma de FoodItems.
 * Reutilizado em MealEntry, DayLog e modal do calendário.
 */
export interface MacroTotals {
  calories: number
  carbsG: number
  fatG: number
  proteinG: number
}

/**
 * Registro nutricional de um dia completo.
 * Espelha a tabela `day_logs` do banco de dados.
 * É a entidade central consumida pelo Calendário e pelo Gráfico.
 */
export interface DayLog {
  id: string
  userId: string
  /** Data no formato ISO 8601 (YYYY-MM-DD) */
  date: string
  meals: MealEntry[]
  /** Totais do dia: soma de todos os meals */
  totals: MacroTotals
  /** Status calórico em relação à meta do usuário */
  calorieStatus: CalorieStatus
  /** Notas livres do usuário para o dia */
  notes: string | null
}

// =============================================================================
// DOMÍNIO: CALENDÁRIO
// =============================================================================

/**
 * Dados de um dia no grid do calendário (7×5).
 * Versão simplificada de DayLog para renderização eficiente.
 */
export interface CalendarDay {
  date: string
  /** true se a data pertence ao mês atualmente exibido */
  isCurrentMonth: boolean
  /** true se é o dia de hoje */
  isToday: boolean
  /** null se não há registro para este dia */
  dayLog: DayLog | null
}

/**
 * Estado do mês exibido no calendário.
 */
export interface CalendarMonth {
  /** Ano (ex: 2025) */
  year: number
  /** Mês 1-indexed (1 = Janeiro, 12 = Dezembro) */
  month: number
  days: CalendarDay[]
}

// =============================================================================
// DOMÍNIO: GRÁFICO (RECHARTS)
// =============================================================================

/**
 * Um ponto de dados para o gráfico de Consumo vs. Manutenção.
 * Cada ponto representa um dia.
 */
export interface CalorieChartPoint {
  /** Data formatada para exibição (ex: "19 abr") */
  label: string
  /** Data em formato ISO para lookups */
  date: string
  /** Calorias consumidas no dia */
  consumed: number
  /** Meta de manutenção do usuário */
  maintenance: number
  /** Diferença: consumed - maintenance (positivo = excesso, negativo = déficit) */
  delta: number
  calorieStatus: CalorieStatus
}

/**
 * Anotação contextual exibida no gráfico Recharts
 * (ex: "Excesso Calórico no Almoço - Sábado").
 */
export interface ChartAnnotation {
  date: string
  label: string
  calorieStatus: CalorieStatus
  /** Coordenada X em pixels (calculada pelo Recharts) */
  x?: number
  /** Coordenada Y em pixels (calculada pelo Recharts) */
  y?: number
}

// =============================================================================
// DOMÍNIO: CHAT IA
// =============================================================================

/**
 * Remetente de uma mensagem no chat.
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Uma mensagem individual no histórico do chat.
 * Compatível com o shape da Vercel AI SDK.
 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: Date
}

/**
 * Contexto nutricional injetado no prompt do sistema da IA.
 * Permite que a IA responda com dados reais do usuário.
 */
export interface AiNutritionContext {
  user: Pick<User, 'name' | 'goals'>
  todayLog: DayLog | null
  /** Últimos 7 dias para análise semanal */
  recentLogs: DayLog[]
}

// =============================================================================
// DOMÍNIO: API / SERVER ACTIONS
// =============================================================================

/**
 * Resposta padrão de Server Actions e API Routes.
 * Garante tipagem consistente nos retornos.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

/**
 * Payload para criar ou atualizar um registro de refeição.
 */
export interface UpsertMealPayload {
  dayLogId: string
  mealType: MealType
  items: Omit<FoodItem, 'id'>[]
}

// =============================================================================
// UTILITÁRIOS DE TIPO
// =============================================================================

/** Torna todos os campos de T opcionais exceto os listados em K */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

/** Extrai o tipo dos elementos de um array */
export type ArrayElement<T extends readonly unknown[]> =
  T extends ReadonlyArray<infer U> ? U : never
