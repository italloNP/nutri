// =============================================================================
// app/api/calendar/route.ts
// GET /api/calendar?year=2025&month=5
// Retorna CalendarMonth para o <NutriCalendar /> (Client Component).
// =============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { getCalendarMonth } from '@/lib/dal'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const yearStr = searchParams.get('year')
  const monthStr = searchParams.get('month')

  const now = new Date()
  const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear()
  const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Parâmetros year/month inválidos.' }, { status: 400 })
  }

  try {
    const data = await getCalendarMonth(year, month)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/calendar]', err)
    return NextResponse.json({ error: 'Erro ao buscar dados do calendário.' }, { status: 500 })
  }
}
