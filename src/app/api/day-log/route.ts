// =============================================================================
// app/api/day-log/route.ts
// GET /api/day-log?date=2025-05-03
// Retorna DayLog | null para o <DayModal /> (Client Component).
// =============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { getDayLog } from '@/lib/dal'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Parâmetro date inválido. Formato esperado: YYYY-MM-DD' },
      { status: 400 },
    )
  }

  try {
    const data = await getDayLog(date)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/day-log]', err)
    return NextResponse.json({ error: 'Erro ao buscar dados do dia.' }, { status: 500 })
  }
}
