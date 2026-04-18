import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data, error: err } = await db
    .from('sessions')
    .select('*, users(name, car_plate), chargers(charger_code, power_kw)')
    .order('start_time', { ascending: false })
    .limit(100)

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })

  const sessions = data.map((s: any) => ({
    ...s,
    customer_name: s.users?.name,
    car_plate: s.users?.car_plate,
    charger_code: s.chargers?.charger_code,
    power_kw: s.chargers?.power_kw,
  }))

  return NextResponse.json({ success: true, sessions })
}
