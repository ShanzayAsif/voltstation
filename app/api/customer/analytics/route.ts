import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || '1'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Today sessions count
  const { count: today_sessions } = await db
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', today.toISOString())

  // Recent sessions for speed chart
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { data: weeklySessions } = await db
    .from('sessions')
    .select('start_time, avg_speed_kw, duration_min, energy_kwh, improvement_pct')
    .eq('status', 'completed')
    .gte('start_time', sevenDaysAgo.toISOString())
    .order('start_time')

  // Group by day
  const dayMap: Record<string, { speeds: number[]; sessions: number }> = {}
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  ;(weeklySessions || []).forEach((s: any) => {
    const d = new Date(s.start_time)
    const key = days[d.getDay()]
    if (!dayMap[key]) dayMap[key] = { speeds: [], sessions: 0 }
    if (s.avg_speed_kw) dayMap[key].speeds.push(Number(s.avg_speed_kw))
    dayMap[key].sessions++
  })

  const weeklyChart = Object.entries(dayMap).map(([day, v]) => ({
    day,
    avg_speed: v.speeds.length ? Math.round(v.speeds.reduce((a, b) => a + b, 0) / v.speeds.length) : 0,
    sessions: v.sessions,
  }))

  // Stats
  const allStats = weeklySessions || []
  const avg_improvement = allStats.length
    ? Math.round(allStats.reduce((s, r: any) => s + Number(r.improvement_pct || 0), 0) / allStats.length)
    : 18

  // Recent sessions with user/charger info
  const { data: recentSessions } = await db
    .from('sessions')
    .select('*, users(name, car_plate), chargers!inner(charger_code, power_kw, station_id)')
    .eq('chargers.station_id', station_id)
    .order('start_time', { ascending: false })
    .limit(10)

  const sessions = (recentSessions || []).map((s: any) => ({
    ...s,
    customer_name: s.users?.name || '—',
    car_plate: s.users?.car_plate || '—',
    charger_code: s.chargers?.charger_code || '—',
    power_kw: s.chargers?.power_kw || 0,
  }))

  return NextResponse.json({
    success: true,
    today_sessions: today_sessions || 0,
    weekly_chart: weeklyChart,
    avg_improvement,
    recent_sessions: sessions,
  })
}
