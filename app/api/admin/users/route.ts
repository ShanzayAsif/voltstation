import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const search = req.nextUrl.searchParams.get('search') || ''

  let query = db
    .from('users')
    .select(`
      *,
      sessions(count),
      revenue:sessions(cost.sum())
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,car_model.ilike.%${search}%`)
  }

  const { data, error: err } = await query
  if (err) {
    // Fallback: simple query without aggregates
    const { data: simple, error: simpleErr } = await db
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (simpleErr) return NextResponse.json({ success: false, error: simpleErr.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      users: (simple || []).map((u: any) => ({ ...u, actual_sessions: u.total_sessions, actual_spent: u.total_spent }))
    })
  }

  const users = (data || []).map((u: any) => ({
    ...u,
    actual_sessions: u.total_sessions || 0,
    actual_spent: u.total_spent || 0,
  }))

  return NextResponse.json({ success: true, users })
}
