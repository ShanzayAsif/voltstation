import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data, error: err } = await db
    .from('admins')
    .select('id, name, username, role, station_id, last_login, is_active, created_at')
    .order('created_at')

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, admins: data })
}

export async function POST(req: NextRequest) {
  const { error, admin } = requireAuth(req)
  if (error) return error

  // Only super_admin can create admins
  if (admin!.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
  }

  const { name, username, password, role } = await req.json()
  if (!name || !username || !password) {
    return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 })
  }

  const db = createServerClient()
  const hashed = await bcrypt.hash(password, 12)

  const { data, error: err } = await db
    .from('admins')
    .insert({ name, username, password: hashed, role: role || 'operator', station_id: admin!.station_id })
    .select('id, name, username, role')
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, admin: data })
}
