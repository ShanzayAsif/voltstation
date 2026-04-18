import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || '1'

  const { data: queue, error } = await db
    .from('queue')
    .select('*, chargers!inner(station_id)')
    .eq('status', 'waiting')
    .eq('chargers.station_id', station_id)
    .order('position')

  if (error) {
    // fallback without join
    const { data: q2, error: e2 } = await db
      .from('queue')
      .select('*')
      .eq('status', 'waiting')
      .order('position')
    if (e2) return NextResponse.json({ success: false, error: e2.message }, { status: 500 })
    return NextResponse.json({ success: true, queue: q2 || [], count: q2?.length || 0 })
  }

  return NextResponse.json({ success: true, queue: queue || [], count: queue?.length || 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createServerClient()

  const { count } = await db.from('queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
  const position = (count || 0) + 1

  const { data, error } = await db
    .from('queue')
    .insert({ ...body, position, status: 'waiting' })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, entry: data, position }, { status: 201 })
}
