import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Public analytics endpoint — used by both customer and admin dashboards
export async function GET(req: NextRequest) {
  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || '1'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: today_sessions } = await db
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', today.toISOString())

  const { data: allSessions } = await db
    .from('sessions')
    .select('duration_min, energy_kwh, improvement_pct, cost')
    .eq('status', 'completed')

  const sessions = allSessions || []
  const total_kwh = sessions.reduce((s: number, r: any) => s + Number(r.energy_kwh || 0), 0)
  const avg_duration = sessions.length
    ? Math.round(sessions.reduce((s: number, r: any) => s + Number(r.duration_min || 0), 0) / sessions.length)
    : 0
  const avg_improvement = sessions.length
    ? Math.round(sessions.reduce((s: number, r: any) => s + Number(r.improvement_pct || 0), 0) / sessions.length)
    : 0

  return NextResponse.json({
    success: true,
    today_sessions: today_sessions || 0,
    stats: { total_kwh, avg_duration, avg_improvement },
  })
}

