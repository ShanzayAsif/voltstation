import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireAuth(req)
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const db = createServerClient()

  const { data, error: err } = await db
    .from('chargers')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, charger: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireAuth(req)
  if (error) return error

  const { id } = await params
  const db = createServerClient()
  const { error: err } = await db.from('chargers').delete().eq('id', id)

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
