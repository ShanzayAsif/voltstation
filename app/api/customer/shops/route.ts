import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || '1'

  const { data, error } = await db
    .from('shops')
    .select('*')
    .eq('station_id', station_id)
    .order('name')

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, shops: data || [] })
}
