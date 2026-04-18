import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const db = createServerClient()
  const { data, error: err } = await db
    .from('car_wash')
    .select('*, users(name, car_model, car_plate)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })

  const washes = data.map((w: any) => ({
    ...w,
    name: w.users?.name,
    car_model: w.users?.car_model,
    car_plate: w.users?.car_plate,
  }))

  return NextResponse.json({ success: true, washes })
}

export async function POST(req: NextRequest) {
  const { error } = requireAuth(req)
  if (error) return error

  const body = await req.json()
  const db = createServerClient()

  const { data, error: err } = await db
    .from('car_wash')
    .insert({ ...body, booked_at: new Date().toISOString(), status: 'scheduled' })
    .select()
    .single()

  if (err) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  return NextResponse.json({ success: true, wash: data })
}
