import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_CUSTOMER_SECRET || 'voltstation-customer-secret-2025'

function getUser(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try { return jwt.verify(auth.slice(7), SECRET) as any } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const db = createServerClient()
  const { data, error } = await db
    .from('bookings')
    .select('*, chargers(charger_code, type, power_kw)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const bookings = (data || []).map((b: any) => ({
    ...b,
    charger_code: b.chargers?.charger_code,
    type: b.chargers?.type,
    power_kw: b.chargers?.power_kw,
  }))

  return NextResponse.json({ success: true, bookings })
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { charger_id, charger_type, booked_at, wash_pkg } = await req.json()
  if (!charger_id || !booked_at) return NextResponse.json({ success: false, error: 'charger_id and booked_at required' }, { status: 400 })

  const db = createServerClient()

  // Check slot conflict
  const { data: conflict } = await db
    .from('bookings')
    .select('id')
    .eq('charger_id', charger_id)
    .eq('booked_at', booked_at)
    .not('status', 'in', '(cancelled)')

  if (conflict && conflict.length > 0) return NextResponse.json({ success: false, error: 'This slot is already booked. Please pick another time.' }, { status: 409 })

  const washPrices: Record<string, number> = { basic: 500, premium: 1200, deluxe: 2500 }
  const washCost = wash_pkg ? (washPrices[wash_pkg] || 0) : 0
  const chargeEst = charger_type === 'DC_ULTRA' ? 2000 : charger_type === 'DC_FAST' ? 1500 : 900
  const estimated_amt = chargeEst + washCost

  const ref = 'VS-' + Date.now().toString().slice(-5)

  const { data, error } = await db
    .from('bookings')
    .insert({ booking_ref: ref, user_id: user.id, charger_id, charger_type, booked_at, wash_pkg: wash_pkg || null, estimated_amt, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, booking: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

  const db = createServerClient()
  const { error } = await db
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)
    .not('status', 'in', '(completed,cancelled)')

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Booking cancelled' })
}
