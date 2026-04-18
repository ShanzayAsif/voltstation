import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const station_id = admin!.station_id

  // Today's revenue
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayData } = await db
    .from('revenue')
    .select('amount')
    .eq('station_id', station_id)
    .gte('recorded_at', today.toISOString())

  const todayTotal = (todayData || []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)

  // Revenue by source (all time)
  const { data: allRevenue } = await db
    .from('revenue')
    .select('source, amount')
    .eq('station_id', station_id)

  const bySource: Record<string, number> = {}
  ;(allRevenue || []).forEach((r: any) => {
    bySource[r.source] = (bySource[r.source] || 0) + Number(r.amount || 0)
  })
  const by_source = Object.entries(bySource).map(([source, total]) => ({ source, total }))

  // Monthly revenue (last 8 months)
  const { data: monthlyData } = await db
    .from('revenue')
    .select('amount, recorded_at')
    .eq('station_id', station_id)
    .gte('recorded_at', new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString())

  const monthly: Record<string, { total: number; m: string; month_name: string }> = {}
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  ;(monthlyData || []).forEach((r: any) => {
    const d = new Date(r.recorded_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) monthly[key] = { total: 0, m: key, month_name: monthNames[d.getMonth()] }
    monthly[key].total += Number(r.amount || 0)
  })

  const sortedMonthly = Object.values(monthly).sort((a, b) => a.m.localeCompare(b.m)).slice(-8)

  return NextResponse.json({
    success: true,
    today: todayTotal,
    by_source,
    monthly: sortedMonthly,
  })
}
