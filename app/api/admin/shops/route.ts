import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data, error: err } = await db
    .from('shops')
    .select('*')
    .eq('station_id', admin!.station_id)
    .order('name')

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, shops: data })
}

export async function POST(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  const { data, error: err } = await db
    .from('shops')
    .insert({ ...body, station_id: admin!.station_id })
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, shop: data })
}
