// =============================================================================
// app/api/chat/route.ts
// API Route de Chat — Node.js Runtime (não Edge, pois usa o driver postgres).
//
// Fluxo (Etapa 7 — Tool Calling):
// 1. Recebe { messages, inputTimestamp } do cliente
// 2. Constrói system prompt com últimos 3 dias detalhados + horários
// 3. Define 3 tools: get_day_logs, log_meal, delete_meal
// 4. Loop de tool calling (máx 5 rounds) executando tools diretamente na DAL
// 5. Stream da resposta final em text/plain
// =============================================================================
import {
  getTodayLog,
  getDayLogs,
  getUser,
  getDayLogRange,
  upsertMealEntry,
  deleteMealEntry,
} from '@/lib/dal'
import { CALORIE_STATUS_LABELS, MEAL_TYPE_LABELS, MEAL_TYPES } from '@/constants/nutrition'
import type { DayLog, MealType } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 5
const TZ = 'America/Sao_Paulo'

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface IncomingPart {
  type: string
  text?: string
}

interface IncomingMessage {
  role: string
  content?: string | IncomingPart[]
  parts?: IncomingPart[]
  id?: string
  status?: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  tool_calls?: OpenRouterToolCall[]
  tool_call_id?: string
  name?: string
}

interface OpenRouterToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

interface OpenRouterNonStreamResponse {
  choices: Array<{
    finish_reason: string
    message: {
      role: string
      content: string | null
      tool_calls?: OpenRouterToolCall[]
    }
  }>
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_day_logs',
      description:
        'Busca registros nutricionais completos (refeições e itens) de um intervalo de datas. ' +
        'Use quando o usuário pedir dados de dias além dos 3 dias já presentes no contexto. ' +
        'Máximo de 30 dias por chamada.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Data de início no formato YYYY-MM-DD (inclusive).',
          },
          to: {
            type: 'string',
            description: 'Data de fim no formato YYYY-MM-DD (inclusive).',
          },
        },
        required: ['from', 'to'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'log_meal',
      description:
        'Registra ou substitui uma refeição em uma data específica. ' +
        'Se já existir uma refeição do mesmo tipo naquele dia, ela é substituída. ' +
        'Sempre estime os macros com base em valores nutricionais padrão e confirme com o usuário antes de chamar esta tool. ' +
        'Retorna o DayLog atualizado com os novos totais.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Data da refeição no formato YYYY-MM-DD.',
          },
          meal_type: {
            type: 'string',
            enum: [...MEAL_TYPES],
            description: 'Tipo de refeição.',
          },
          items: {
            type: 'array',
            description: 'Lista de alimentos da refeição.',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nome do alimento.' },
                quantity_g: { type: 'number', description: 'Quantidade em gramas.' },
                calories: { type: 'number', description: 'Calorias totais para esta quantidade.' },
                carbs_g: { type: 'number', description: 'Carboidratos em gramas.' },
                fat_g: { type: 'number', description: 'Gorduras em gramas.' },
                protein_g: { type: 'number', description: 'Proteínas em gramas.' },
              },
              required: ['name', 'quantity_g', 'calories', 'carbs_g', 'fat_g', 'protein_g'],
            },
            minItems: 1,
          },
        },
        required: ['date', 'meal_type', 'items'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_meal',
      description:
        'Remove uma refeição existente pelo seu ID. ' +
        'Use o ID da refeição exibido no contexto dos últimos 3 dias. ' +
        'Retorna o DayLog atualizado com os novos totais.',
      parameters: {
        type: 'object',
        properties: {
          meal_entry_id: {
            type: 'string',
            description: 'ID único da refeição a ser removida (campo id do MealEntry).',
          },
        },
        required: ['meal_entry_id'],
      },
    },
  },
]

// ─── Formatadores de horário ──────────────────────────────────────────────────

function formatDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('pt-BR', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

async function buildSystemPrompt(inputTimestamp: string | null): Promise<string> {
  const user = await getUser()
  const todayLog = await getTodayLog()
  const allLogs = await getDayLogs()

  const now = new Date()
  const nowStr = formatDateTime(now)
  const inputStr = inputTimestamp ? formatDateTime(new Date(inputTimestamp)) : nowStr

  // ── Últimos 3 dias detalhados ─────────────────────────────────────────────
  const today = now.toLocaleDateString('en-CA', { timeZone: TZ }) // YYYY-MM-DD

  // Pega os 3 dias mais recentes com dados (incluindo hoje)
  const last3Days: DayLog[] = []

  // Adiciona hoje (pode ser null)
  if (todayLog) last3Days.push(todayLog)

  // Adiciona dias anteriores do mês até ter 3
  const logsWithData = allLogs
    .filter((l) => l.date < today && l.calorieStatus !== 'no_data')
    .slice(-3)

  for (const log of logsWithData.reverse()) {
    if (last3Days.length >= 3) break
    last3Days.push(log)
  }

  last3Days.sort((a, b) => a.date.localeCompare(b.date))

  function formatDayLogDetail(log: DayLog): string {
    const dateLabel = formatDate(log.date)
    const isToday = log.date === today
    const header = `--- ${dateLabel}${isToday ? ' (HOJE)' : ''} [ID do dia: ${log.id}] ---`

    if (log.meals.length === 0) {
      return `${header}\n  Sem refeições registradas. Total: 0 kcal`
    }

    const mealsStr = log.meals
      .map((meal) => {
        const mealLabel = MEAL_TYPE_LABELS[meal.type as MealType] ?? meal.type
        const mealTime = new Date(meal.loggedAt).toLocaleTimeString('pt-BR', {
          timeZone: TZ,
          hour: '2-digit',
          minute: '2-digit',
        })
        const itemsStr = meal.items
          .map(
            (item) =>
              `    • ${item.name} ${item.quantityG}g — ${item.calories} kcal | P: ${item.proteinG}g | C: ${item.carbsG}g | G: ${item.fatG}g`,
          )
          .join('\n')
        return `  ${mealLabel} (${mealTime}) [ID: ${meal.id}]\n${itemsStr}\n  Subtotal: ${meal.totals.calories} kcal | P: ${meal.totals.proteinG}g | C: ${meal.totals.carbsG}g | G: ${meal.totals.fatG}g`
      })
      .join('\n\n')

    const status = CALORIE_STATUS_LABELS[log.calorieStatus] ?? log.calorieStatus
    return `${header}\n${mealsStr}\n\n  TOTAL DO DIA: ${log.totals.calories} kcal | P: ${log.totals.proteinG}g | C: ${log.totals.carbsG}g | G: ${log.totals.fatG}g — ${status}`
  }

  const last3DaysSection =
    last3Days.length > 0
      ? last3Days.map(formatDayLogDetail).join('\n\n')
      : 'Nenhum dado nos últimos 3 dias.'

  // ── Resumo dos últimos 7 dias (linha por dia) ──────────────────────────────
  const recent7 = allLogs.filter((l) => l.date <= today).slice(-7)

  const weekSection = recent7
    .map((log) => {
      const label = formatDate(log.date)
      return `  - ${label}: ${log.totals.calories} kcal (${CALORIE_STATUS_LABELS[log.calorieStatus]})`
    })
    .join('\n')

  // ── Prompt final ───────────────────────────────────────────────────────────
  return `Você é a Nutri IA, assistente nutricional pessoal e exclusiva de ${user.name}.

═══════════════════════════════════════
CONTEXTO TEMPORAL
═══════════════════════════════════════
Horário atual: ${nowStr}
Horário da mensagem do usuário: ${inputStr}

═══════════════════════════════════════
PERFIL DO USUÁRIO
═══════════════════════════════════════
Nome: ${user.name}
Meta calórica diária: ${user.goals.dailyCalories} kcal
Metas de macros → Proteína: ${user.goals.dailyProteinG}g | Carbs: ${user.goals.dailyCarbsG}g | Gordura: ${user.goals.dailyFatG}g

═══════════════════════════════════════
ÚLTIMOS 3 DIAS (DETALHADO)
═══════════════════════════════════════
${last3DaysSection}

═══════════════════════════════════════
RESUMO DOS ÚLTIMOS 7 DIAS
═══════════════════════════════════════
${weekSection || '  Sem dados suficientes.'}

═══════════════════════════════════════
INSTRUÇÕES DE COMPORTAMENTO
═══════════════════════════════════════
- Responda SEMPRE em português brasileiro, de forma amigável, objetiva e motivadora.
- NUNCA use formatação Markdown na sua resposta (evite terminantemente negrito com "**", itálico, listas com asteriscos, títulos com "#", etc.). Retorne apenas texto simples e puro (plain text) sem marcações.
- Base suas respostas nos dados reais acima quando relevante.
- Ao registrar refeições: estime os macros, CONFIRME com o usuário e só então chame log_meal.
- Use o horário atual e da mensagem para contextualizar respostas ("você acabou de jantar", "bom dia", etc.).
- Para dados além dos 3 dias do contexto, use a tool get_day_logs.
- Após log_meal ou delete_meal, informe o novo total do dia e se está dentro da meta.
- Use os IDs de refeição (exibidos no contexto acima) ao chamar delete_meal.
- Nunca invente dados que não estejam no contexto ou retornados por uma tool.
- Mantenha respostas concisas (máx 200 palavras), salvo análises detalhadas solicitadas.`
}

// ─── Normalizador de mensagens ────────────────────────────────────────────────

function normalizeMessages(incoming: IncomingMessage[]): ChatMessage[] {
  return incoming
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((msg) => {
      let text = ''

      if (Array.isArray(msg.parts)) {
        text = msg.parts
          .filter((p) => p.type === 'text')
          .map((p) => p.text ?? '')
          .join('')
      } else if (Array.isArray(msg.content)) {
        text = msg.content
          .filter((p) => p.type === 'text')
          .map((p) => p.text ?? '')
          .join('')
      } else if (typeof msg.content === 'string') {
        text = msg.content
      }

      return {
        role: msg.role as 'user' | 'assistant',
        content: text,
      }
    })
    .filter((m) => m.content && m.content.length > 0)
}

// ─── Execução de tools (DAL direto, sem HTTP loopback) ────────────────────────

async function executeTool(name: string, argsJson: string): Promise<string> {
  let args: Record<string, unknown>
  try {
    args = JSON.parse(argsJson) as Record<string, unknown>
  } catch {
    return JSON.stringify({ error: 'Argumentos da tool inválidos (JSON parse error).' })
  }

  try {
    if (name === 'get_day_logs') {
      const from = args.from as string
      const to = args.to as string

      if (!from || !to) {
        return JSON.stringify({ error: 'Parâmetros "from" e "to" são obrigatórios.' })
      }

      const logs = await getDayLogRange(from, to)

      if (logs.length === 0) {
        return JSON.stringify({
          message: `Nenhum registro encontrado entre ${from} e ${to}.`,
          logs: [],
        })
      }

      return JSON.stringify({
        message: `${logs.length} dia(s) encontrado(s) entre ${from} e ${to}.`,
        logs: logs.map((log) => ({
          date: log.date,
          calorieStatus: CALORIE_STATUS_LABELS[log.calorieStatus],
          totals: log.totals,
          meals: log.meals.map((meal) => ({
            id: meal.id,
            type: meal.type,
            typeLabel: MEAL_TYPE_LABELS[meal.type as MealType] ?? meal.type,
            loggedAt: meal.loggedAt,
            totals: meal.totals,
            items: meal.items,
          })),
        })),
      })
    }

    if (name === 'log_meal') {
      const date = args.date as string
      const mealType = args.meal_type as string
      const rawItems = args.items as Array<Record<string, unknown>>

      if (!date || !mealType || !rawItems?.length) {
        return JSON.stringify({ error: 'Parâmetros date, meal_type e items são obrigatórios.' })
      }

      if (!MEAL_TYPES.includes(mealType as MealType)) {
        return JSON.stringify({
          error: `meal_type inválido: "${mealType}". Valores aceitos: ${MEAL_TYPES.join(', ')}`,
        })
      }

      const items = rawItems.map((item) => ({
        name: String(item.name ?? ''),
        quantityG: Number(item.quantity_g ?? 0),
        calories: Number(item.calories ?? 0),
        carbsG: Number(item.carbs_g ?? 0),
        fatG: Number(item.fat_g ?? 0),
        proteinG: Number(item.protein_g ?? 0),
      }))

      const updatedLog = await upsertMealEntry({ date, mealType: mealType as MealType, items })
      const mealLabel = MEAL_TYPE_LABELS[mealType as MealType] ?? mealType

      return JSON.stringify({
        success: true,
        message: `${mealLabel} registrado com sucesso em ${date}.`,
        updatedDayTotals: updatedLog.totals,
        calorieStatus: CALORIE_STATUS_LABELS[updatedLog.calorieStatus],
        meals: updatedLog.meals.map((m) => ({
          id: m.id,
          type: m.type,
          totals: m.totals,
          items: m.items,
        })),
      })
    }

    if (name === 'delete_meal') {
      const mealEntryId = args.meal_entry_id as string

      if (!mealEntryId) {
        return JSON.stringify({ error: 'Parâmetro meal_entry_id é obrigatório.' })
      }

      const updatedLog = await deleteMealEntry(mealEntryId)

      return JSON.stringify({
        success: true,
        message: `Refeição removida com sucesso.`,
        updatedDayTotals: updatedLog.totals,
        calorieStatus: CALORIE_STATUS_LABELS[updatedLog.calorieStatus],
        date: updatedLog.date,
      })
    }

    return JSON.stringify({ error: `Tool desconhecida: "${name}".` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return JSON.stringify({ error: message })
  }
}

// ─── Request Handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: IncomingMessage[]; inputTimestamp?: string }

  if (!body?.messages) {
    return streamPlainText('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.')
  }

  const normalizedMessages = normalizeMessages(body.messages)
  const inputTimestamp = body.inputTimestamp ?? null
  const systemPrompt = await buildSystemPrompt(inputTimestamp)

  // Fallback mock se não houver API key configurada
  if (!process.env.OPENROUTER_API_KEY) {
    const lastUser = normalizedMessages.findLast((m) => m.role === 'user')
    const mockResponse = getMockResponse(lastUser?.content?.toLowerCase() ?? '')
    return streamPlainText(mockResponse)
  }

  const model = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-preview'

  // Constrói histórico de mensagens para o OpenRouter
  const conversationHistory: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...normalizedMessages,
  ]

  // ─── Loop de Tool Calling ──────────────────────────────────────────────────
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const isLastIteration = iteration === MAX_TOOL_ITERATIONS - 1

    // Chamadas intermediárias sem stream; stream apenas na resposta final de texto
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Nutri IA',
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 800,
        temperature: 0.7,
        tools: TOOLS,
        tool_choice: isLastIteration ? 'none' : 'auto',
        messages: conversationHistory,
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text()
      console.error('[chat/route] OpenRouter error:', errText)
      return streamPlainText('Desculpe, ocorreu um erro ao conectar com a IA. Tente novamente.')
    }

    const response = (await upstream.json()) as OpenRouterNonStreamResponse
    const choice = response.choices?.[0]

    if (!choice) {
      return streamPlainText('Desculpe, ocorreu um erro inesperado. Tente novamente.')
    }

    const { finish_reason, message } = choice

    // Resposta final de texto — streama de volta ao cliente
    if (finish_reason === 'stop' || finish_reason === 'end_turn') {
      const finalText = message.content ?? 'Não consegui gerar uma resposta. Tente novamente.'
      return streamPlainText(finalText)
    }

    // Modelo quer chamar tools
    if (finish_reason === 'tool_calls' && message.tool_calls?.length) {
      // Adiciona a mensagem do assistant (com tool_calls) ao histórico
      conversationHistory.push({
        role: 'assistant',
        content: message.content,
        tool_calls: message.tool_calls,
      })

      // Executa cada tool e adiciona os resultados ao histórico
      for (const toolCall of message.tool_calls) {
        const result = await executeTool(toolCall.function.name, toolCall.function.arguments)
        conversationHistory.push({
          role: 'tool',
          content: result,
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
        })
      }

      // Continua o loop para obter a resposta final do modelo
      continue
    }

    // finish_reason inesperado (length, content_filter, etc.)
    const partialText = message.content
    if (partialText) return streamPlainText(partialText)
    return streamPlainText('Desculpe, a resposta foi interrompida. Tente novamente.')
  }

  // Limite de iterações atingido
  return streamPlainText(
    'Desculpe, a operação demorou demais. Por favor, tente uma solicitação mais simples.',
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function streamPlainText(text: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const words = text.split(' ')
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '))
        await new Promise<void>((r) => setTimeout(r, 30))
      }
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
      Connection: 'keep-alive',
    },
  })
}

// ─── Mock Responses (sem API key) ─────────────────────────────────────────────

function getMockResponse(input: string): string {
  if (input.includes('almoço') || input.includes('almoco') || input.includes('refeição')) {
    return 'Ótimo! Para registrar seu almoço, me diga o que você comeu e a quantidade aproximada em gramas. Por exemplo: "150g de frango grelhado, 180g de arroz e salada." Vou calcular os macros para você!'
  }
  if (input.includes('ontem') || input.includes('analisar')) {
    return 'Analisando seus dados de ontem: você ficou dentro da sua meta calórica, o que é excelente! Sua ingestão de proteína foi boa, mas os carboidratos ficaram um pouco abaixo do ideal. Tente incluir uma fonte de carboidratos complexos no café da manhã amanhã.'
  }
  if (input.includes('proteína') || input.includes('proteina')) {
    return 'Para aumentar sua ingestão de proteína de forma prática: 🥚 Adicione 2 ovos no café da manhã (+12g) • 🍗 Aumente o peito de frango para 200g no almoço (+33g) • 🥛 Inclua iogurte grego no lanche (+9g) • 🐟 Salmão no jantar (+20g). Essas mudanças simples te aproximam da meta de 165g/dia!'
  }
  if (input.includes('semana') || input.includes('resumo')) {
    return 'Sua semana nutricional foi bastante variada! Você teve dias excelentes de equilíbrio calórico, mas também alguns dias com excesso no fim de semana. Sua média ficou em torno de 2061 kcal, ligeiramente abaixo da meta de 2200 kcal — o que indica um déficit saudável. Continue assim!'
  }
  return 'Olá! Sou sua Nutri IA. Posso te ajudar a analisar sua alimentação, registrar refeições, dar dicas de macros ou fazer um resumo da sua semana. Como posso ajudar hoje?'
}
