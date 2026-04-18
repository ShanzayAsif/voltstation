import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || admin!.station_id

  const { data: chargers, error: err } = await db
    .from('chargers')
    .select('*')
    .eq('station_id', station_id)
    .order('charger_code')

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, chargers })
}

export async function POST(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  const { data, error: err } = await db
    .from('chargers')
    .insert({ ...body, station_id: body.station_id || admin!.station_id, sessions_today: 0 })
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, charger: data })
}
