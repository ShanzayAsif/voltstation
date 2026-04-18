import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// One-time seed endpoint — run once after DB setup
// POST /api/seed
export async function POST(req: NextRequest) {
  // Simple security: require a secret param
  const { secret } = await req.json().catch(() => ({}))
  if (secret !== 'voltstation-seed-2025') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = createServerClient()

  const admins = [
    { name: 'Super Admin',   username: 'admin',    pw: 'volt2025',    role: 'super_admin' },
    { name: 'Ali Manager',   username: 'ali.mgr',  pw: 'manager123',  role: 'manager'     },
    { name: 'Sara Operator', username: 'sara.op',  pw: 'operator123', role: 'operator'    },
  ]

  const results = []
  for (const a of admins) {
    const hashed = await bcrypt.hash(a.pw, 12)
    const { error } = await db.from('admins').upsert(
      { name: a.name, username: a.username, password: hashed, role: a.role, station_id: 1 },
      { onConflict: 'username' }
    )
    results.push({ username: a.username, error: error?.message || null })
  }

  return NextResponse.json({
    success: true,
    message: 'Admins seeded',
    results,
    credentials: admins.map(a => ({ username: a.username, password: a.pw, role: a.role }))
  })
}
