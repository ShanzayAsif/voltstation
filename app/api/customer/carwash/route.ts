import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_CUSTOMER_SECRET || 'voltstation-customer-secret-2025'

function getUser(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try { return jwt.verify(auth.slice(7), SECRET) as any } catch { return null }
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { package: pkg } = await req.json()
  const prices: Record<string, number> = { basic: 500, premium: 1200, deluxe: 2500 }
  if (!prices[pkg]) return NextResponse.json({ success: false, error: 'Invalid package. Choose: basic, premium, or deluxe' }, { status: 400 })

  const db = createServerClient()
  const { data, error } = await db
    .from('car_wash')
    .insert({ user_id: user.id, package: pkg, price: prices[pkg], booked_at: new Date().toISOString(), status: 'scheduled' })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, wash: data, message: `${pkg} car wash booked for Rs.${prices[pkg]}` }, { status: 201 })
}
