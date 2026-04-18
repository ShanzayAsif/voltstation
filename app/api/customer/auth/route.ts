import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_CUSTOMER_SECRET || 'voltstation-customer-secret-2025'

// Normalize phone: strip spaces, dashes, +92 prefix → 03XXXXXXXXX
function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '')
  if (p.startsWith('+92')) p = '0' + p.slice(3)
  if (p.startsWith('92') && p.length === 12) p = '0' + p.slice(2)
  return p
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, name, car_model, car_plate } = body
  const phone = normalizePhone(body.phone || '')

  if (!phone) return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 })

  const db = createServerClient()

  if (action === 'register') {
    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })

    // Check existing
    const { data: existing } = await db.from('users').select('id').eq('phone', phone).maybeSingle()
    if (existing) return NextResponse.json({ success: false, error: 'Phone already registered. Please login instead.' }, { status: 400 })

    const { data: user, error } = await db
      .from('users')
      .insert({ name, phone, car_model: car_model || null, car_plate: car_plate || null })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    const token = jwt.sign({ id: user.id, phone: user.phone, name: user.name }, SECRET, { expiresIn: '30d' })
    return NextResponse.json({
      success: true, token,
      user: { id: user.id, name: user.name, phone: user.phone, car_model: user.car_model, car_plate: user.car_plate }
    }, { status: 201 })
  }

  if (action === 'login') {
    const { data: user, error } = await db.from('users').select('*').eq('phone', phone).maybeSingle()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    if (!user) return NextResponse.json({ success: false, error: 'Phone not found. Please register first.' }, { status: 404 })

    const token = jwt.sign({ id: user.id, phone: user.phone, name: user.name }, SECRET, { expiresIn: '30d' })
    return NextResponse.json({
      success: true, token,
      user: { id: user.id, name: user.name, phone: user.phone, car_model: user.car_model, car_plate: user.car_plate, is_member: user.is_member }
    })
  }

  return NextResponse.json({ success: false, error: 'Invalid action. Use "login" or "register"' }, { status: 400 })
}
