import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 })
    }

    const db = createServerClient()
    const { data: admin, error } = await db
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await db.from('admins').update({ last_login: new Date().toISOString() }).eq('id', admin.id)

    const token = signToken({
      id: admin.id,
      name: admin.name,
      username: admin.username,
      role: admin.role,
      station_id: admin.station_id || 1,
    })

    return NextResponse.json({
      success: true,
      token,
      admin: { id: admin.id, name: admin.name, username: admin.username, role: admin.role, station_id: admin.station_id || 1 },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
