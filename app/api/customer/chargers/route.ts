import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServerClient()
  const station_id = req.nextUrl.searchParams.get('station_id') || '1'

  const { data: chargers, error } = await db
    .from('chargers')
    .select('*')
    .eq('station_id', station_id)
    .eq('enabled', true)
    .order('charger_code')

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const summary = {
    available: chargers?.filter(c => c.status === 'available').length || 0,
    busy: chargers?.filter(c => c.status === 'busy').length || 0,
    waiting: chargers?.filter(c => c.status === 'waiting').length || 0,
    maintenance: chargers?.filter(c => c.status === 'maintenance').length || 0,
    total: chargers?.length || 0,
  }

  return NextResponse.json({ success: true, chargers, summary })
}
