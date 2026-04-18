import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const status = req.nextUrl.searchParams.get('status')

  let query = db
    .from('bookings')
    .select('*, users(name, phone, car_model, car_plate), chargers(charger_code)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)

  const { data, error: err } = await query
  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })

  const bookings = data.map((b: any) => ({
    ...b,
    name: b.users?.name,
    phone: b.users?.phone,
    car_model: b.users?.car_model,
    car_plate: b.users?.car_plate,
    charger_code: b.chargers?.charger_code,
  }))

  return NextResponse.json({ success: true, bookings })
}

export async function POST(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  const ref = 'VS-' + Math.floor(1000 + Math.random() * 9000)
  const { data, error: err } = await db
    .from('bookings')
    .insert({ ...body, booking_ref: ref, status: 'pending' })
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, booking: data })
}
