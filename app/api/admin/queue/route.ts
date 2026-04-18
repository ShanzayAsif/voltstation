import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data: queue, error: err } = await db
    .from('queue')
    .select('*, users(name, phone)')
    .eq('status', 'waiting')
    .order('position')

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })

  const formatted = queue.map((q: any) => ({
    ...q,
    name: q.users?.name,
    phone: q.users?.phone,
  }))

  return NextResponse.json({ success: true, queue: formatted })
}

export async function POST(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  // Get next position
  const { count } = await db.from('queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
  const position = (count || 0) + 1

  const { data, error: err } = await db
    .from('queue')
    .insert({ ...body, position, status: 'waiting' })
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, entry: data })
}
