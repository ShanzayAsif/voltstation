import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data: station, error: err } = await db
    .from('stations')
    .select('*')
    .eq('id', admin!.station_id)
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, station })
}

export async function PATCH(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  const { data, error: err } = await db
    .from('stations')
    .update(body)
    .eq('id', admin!.station_id)
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, station: data })
}
