import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireAuth(req)
  if (error) return error

  const { id } = await params
  const db = createServerClient()
  const { error: err } = await db.from('queue').update({ status: 'left' }).eq('id', id)

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
