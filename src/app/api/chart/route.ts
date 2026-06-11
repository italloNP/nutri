// =============================================================================
// app/api/chart/route.ts
// GET /api/chart?days=14
// Retorna { chartData, annotations } para o <CalorieChart /> (Client Component).
// =============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { getChartData, getChartAnnotations } from '@/lib/dal'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const daysStr = searchParams.get('days')
  const days = daysStr ? parseInt(daysStr, 10) : 14

  if (isNaN(days) || days < 1 || days > 90) {
    return NextResponse.json({ error: 'Parâmetro days inválido (1–90).' }, { status: 400 })
  }

  try {
    const [chartData, annotations] = await Promise.all([getChartData(days), getChartAnnotations()])
    return NextResponse.json({ chartData, annotations })
  } catch (err) {
    console.error('[api/chart]', err)
    return NextResponse.json({ error: 'Erro ao buscar dados do gráfico.' }, { status: 500 })
  }
}
