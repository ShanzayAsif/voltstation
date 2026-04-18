import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_ADMIN_SECRET || 'voltstation-secret'

export interface AdminPayload {
  id: number
  name: string
  username: string
  role: 'super_admin' | 'manager' | 'operator'
  station_id: number
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): AdminPayload | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return verifyToken(auth.slice(7))
}

export function requireAuth(req: NextRequest) {
  const admin = getTokenFromRequest(req)
  if (!admin) {
    return { error: Response.json({ success: false, error: 'Unauthorized' }, { status: 401 }), admin: null }
  }
  return { error: null, admin }
}
