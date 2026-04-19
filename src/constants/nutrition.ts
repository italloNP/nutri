// =============================================================================
// constants/nutrition.ts
// Constantes de domínio: metas padrão de macros, limites calóricos, etc.
// Estas constantes são usadas pelo mock data, pelos componentes de UI
// e, futuramente, pelos schemas do banco de dados.
// =============================================================================

// -----------------------------------------------------------------------------
// Metas diárias padrão (sobrescritas por NutritionGoals do usuário)
// -----------------------------------------------------------------------------
export const DEFAULT_CALORIE_GOAL = 2200 // kcal — manutenção estimada

export const DEFAULT_MACRO_GOALS = {
  /** Carboidratos em gramas */
  carbsG: 275,
  /** Gorduras em gramas */
  fatG: 73,
  /** Proteínas em gramas */
  proteinG: 165,
} as const

// Percentual de macros em relação às calorias totais
// (referência: 1g carb = 4kcal, 1g fat = 9kcal, 1g protein = 4kcal)
export const MACRO_CALORIES = {
  perGramCarbs: 4,
  perGramFat: 9,
  perGramProtein: 4,
} as const

// -----------------------------------------------------------------------------
// Tipos de refeição
// -----------------------------------------------------------------------------
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout',
] as const

export const MEAL_TYPE_LABELS: Record<(typeof MEAL_TYPES)[number], string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
  pre_workout: 'Pré-Treino',
  post_workout: 'Pós-Treino',
} as const

// -----------------------------------------------------------------------------
// Limites para status calórico diário (usado no calendário e gráfico)
// -----------------------------------------------------------------------------
export const CALORIE_STATUS_THRESHOLDS = {
  /** Déficit severo: < 70% da meta */
  severeDeficit: 0.7,
  /** Déficit moderado: 70–90% da meta */
  moderateDeficit: 0.9,
  /** Equilíbrio: 90–110% da meta */
  balanced: 1.1,
  /** Leve excesso: 110–130% da meta */
  slightSurplus: 1.3,
  /** Excesso calórico: > 130% da meta */
  surplus: Infinity,
} as const

export type CalorieStatus =
  | 'severe_deficit'
  | 'moderate_deficit'
  | 'balanced'
  | 'slight_surplus'
  | 'surplus'
  | 'no_data'

// Mapeamento de status → cor Tailwind (dark mode)
export const CALORIE_STATUS_COLORS: Record<CalorieStatus, string> = {
  severe_deficit: '#ef4444', // red-500
  moderate_deficit: '#f97316', // orange-500
  balanced: '#22c55e', // green-500
  slight_surplus: '#eab308', // yellow-500
  surplus: '#ec4899', // pink-500
  no_data: '#374151', // gray-700
} as const

// Mapeamento de status → label PT-BR
export const CALORIE_STATUS_LABELS: Record<CalorieStatus, string> = {
  severe_deficit: 'Déficit Severo',
  moderate_deficit: 'Déficit Calórico',
  balanced: 'Equilíbrio Perfeito',
  slight_surplus: 'Leve Excesso',
  surplus: 'Excesso Calórico',
  no_data: 'Sem Dados',
} as const

// -----------------------------------------------------------------------------
// Shortcuts de chat rápido
// -----------------------------------------------------------------------------
export const CHAT_QUICK_ACTIONS = [
  { id: 'log_lunch', label: 'Registrar Almoço', prompt: 'Quero registrar o meu almoço de hoje.' },
  {
    id: 'analyze_yesterday',
    label: 'Analisar Ontem',
    prompt: 'Analise minha alimentação de ontem e me dê um feedback detalhado.',
  },
  {
    id: 'protein_tips',
    label: 'Dicas de Proteína',
    prompt: 'Me dê dicas práticas para aumentar minha ingestão de proteína.',
  },
  {
    id: 'weekly_summary',
    label: 'Como foi minha semana?',
    prompt: 'Faça um resumo da minha semana nutricional com pontos positivos e de melhoria.',
  },
] as const
